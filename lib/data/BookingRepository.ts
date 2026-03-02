import fs from 'fs/promises';
import path from 'path';
import { Booking, Cabin, AppConfig, AppData } from '../domain/entities';

export class BookingRepository {
  private dataPath = path.join(process.cwd(), 'data', 'data.json');
  private isWriting = false;
  private writeQueue: (() => void)[] = [];

  private async acquireLock(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isWriting) {
        this.isWriting = true;
        resolve();
      } else {
        this.writeQueue.push(resolve);
      }
    });
  }

  private releaseLock(): void {
    this.isWriting = false;
    const next = this.writeQueue.shift();
    if (next) {
      this.isWriting = true;
      next();
    }
  }

  private async readData(): Promise<AppData> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading data file:', error);
      throw new Error('Could not read data file');
    }
  }

  private async writeData(data: AppData): Promise<void> {
    await this.acquireLock();
    
    try {
      // Crear backup transaccional antes de escribir
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        process.cwd(), 
        'data', 
        `data.backup-${timestamp}.json`
      );
      
      await fs.copyFile(this.dataPath, backupPath);
      
      // Limpiar backups antiguos (mantener solo últimos 50)
      await this.cleanupOldBackups();
      
      // Escribir nuevos datos
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
    } finally {
      this.releaseLock();
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.readdir(dataDir);
      
      // Filtrar solo archivos de backup transaccional
      const backupFiles = files
        .filter(f => f.startsWith('data.backup-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(dataDir, f),
          // Extraer timestamp del nombre del archivo
          timestamp: f.replace('data.backup-', '').replace('.json', '')
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Más recientes primero
      
      // Mantener solo los 50 backups más recientes (aproximadamente 24-48 horas)
      const filesToDelete = backupFiles.slice(50);
      
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`Backup antiguo eliminado: ${file.name}`);
        } catch (error) {
          console.warn(`No se pudo eliminar backup: ${file.name}`, error);
        }
      }
    } catch (error) {
      console.warn('Error durante limpieza de backups:', error);
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    const data = await this.readData();
    return data.bookings;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const bookings = await this.getAllBookings();
    return bookings.find(b => b.id === id) || null;
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const data = await this.readData();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const booking: Booking = {
      ...bookingData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    data.bookings.push(booking);
    await this.writeData(data);
    
    return booking;
  }

  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking | null> {
    const data = await this.readData();
    const index = data.bookings.findIndex(b => b.id === id);
    
    if (index === -1) return null;
    
    data.bookings[index] = {
      ...data.bookings[index],
      ...bookingData,
      id,
      updatedAt: new Date().toISOString()
    };
    
    await this.writeData(data);
    return data.bookings[index];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const data = await this.readData();
    const index = data.bookings.findIndex(b => b.id === id);
    
    if (index === -1) return false;
    
    data.bookings.splice(index, 1);
    await this.writeData(data);
    
    return true;
  }

  async getAllCabins(): Promise<Cabin[]> {
    const data = await this.readData();
    return data.cabins;
  }

  async getCabinById(id: string): Promise<Cabin | null> {
    const cabins = await this.getAllCabins();
    return cabins.find(c => c.id === id) || null;
  }

  async getConfig(): Promise<AppConfig> {
    const data = await this.readData();
    return data.config;
  }

  // ===== SISTEMA DE BACKUP AVANZADO =====
  
  /**
   * Crear backup programado (diario/semanal/mensual)
   */
  async createScheduledBackup(type: 'daily' | 'weekly' | 'monthly'): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    const backupPath = path.join(
      process.cwd(), 
      'data', 
      `data.${type}-${dateStr}-${timeStr}.json`
    );
    
    await fs.copyFile(this.dataPath, backupPath);
    
    // Limpiar backups antiguos del mismo tipo
    await this.cleanupScheduledBackups(type);
    
    console.log(`Backup ${type} creado: ${backupPath}`);
    return backupPath;
  }

  /**
   * Limpiar backups programados antiguos
   */
  private async cleanupScheduledBackups(type: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.readdir(dataDir);
      
      const backupFiles = files
        .filter(f => f.startsWith(`data.${type}-`) && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(dataDir, f),
          timestamp: f.replace(`data.${type}-`, '').replace('.json', '')
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      
      // Retención por tipo
      const retention = {
        daily: 30,   // 30 días
        weekly: 12,  // 12 semanas (3 meses)
        monthly: 12  // 12 meses (1 año)
      };
      
      const filesToDelete = backupFiles.slice(retention[type]);
      
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`Backup ${type} antiguo eliminado: ${file.name}`);
        } catch (error) {
          console.warn(`No se pudo eliminar backup ${type}: ${file.name}`, error);
        }
      }
    } catch (error) {
      console.warn(`Error durante limpieza de backups ${type}:`, error);
    }
  }

  /**
   * Listar todos los backups disponibles
   */
  async listBackups(): Promise<Array<{name: string, type: string, date: string, size: number}>> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.readdir(dataDir);
      
      const backups = [];
      
      for (const file of files) {
        if (file.startsWith('data.') && file.endsWith('.json') && file !== 'data.json') {
          const filePath = path.join(dataDir, file);
          const stats = await fs.stat(filePath);
          
          let type = 'transactional';
          if (file.includes('.daily-')) type = 'daily';
          else if (file.includes('.weekly-')) type = 'weekly';
          else if (file.includes('.monthly-')) type = 'monthly';
          
          backups.push({
            name: file,
            type,
            date: stats.mtime.toISOString(),
            size: stats.size
          });
        }
      }
      
      return backups.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error listando backups:', error);
      return [];
    }
  }

  /**
   * Restaurar desde un backup específico
   */
  async restoreFromBackup(backupFileName: string): Promise<boolean> {
    try {
      const backupPath = path.join(process.cwd(), 'data', backupFileName);
      
      // Verificar que el backup existe
      await fs.access(backupPath);
      
      // Crear backup del estado actual antes de restaurar
      await this.createScheduledBackup('daily');
      
      // Restaurar
      await fs.copyFile(backupPath, this.dataPath);
      
      console.log(`Datos restaurados desde: ${backupFileName}`);
      return true;
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return false;
    }
  }
}