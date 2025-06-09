import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class ImageService {
  private readonly IMAGES_DIR = `${FileSystem.documentDirectory}character_images/`;
  private readonly STORAGE_KEY = 'character_profile_images';

  constructor() {
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.IMAGES_DIR, { intermediates: true });
        console.log('📁 Images directory created');
      }
    } catch (error) {
      console.error('❌ Error creating images directory:', error);
    }
  }

  /**
   * Sauvegarde une image de personnage
   */
  async saveCharacterImage(characterId: number, imageUri: string): Promise<string> {
    try {
      await this.ensureDirectoryExists();
      
      const filename = `character_${characterId}.jpg`;
      const destinationPath = `${this.IMAGES_DIR}${filename}`;

      // Copier l'image vers le répertoire de l'app
      await FileSystem.copyAsync({
        from: imageUri,
        to: destinationPath,
      });

      // Sauvegarder la référence dans AsyncStorage
      await this.saveImageReference(characterId, destinationPath);

      console.log('✅ Character image saved:', destinationPath);
      return destinationPath;
    } catch (error) {
      console.error('❌ Error saving character image:', error);
      throw new Error('Failed to save character image');
    }
  }

  /**
   * Récupère l'image d'un personnage
   */
  async getCharacterImage(characterId: number): Promise<string | null> {
    try {
      const imagePath = await this.getImageReference(characterId);
      if (!imagePath) {
        return null;
      }

      // Vérifier que le fichier existe toujours
      const fileInfo = await FileSystem.getInfoAsync(imagePath);
      if (fileInfo.exists) {
        return imagePath;
      } else {
        // Le fichier n'existe plus, nettoyer la référence
        await this.removeImageReference(characterId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting character image:', error);
      return null;
    }
  }

  /**
   * Supprime l'image d'un personnage
   */
  async removeCharacterImage(characterId: number): Promise<void> {
    try {
      const imagePath = await this.getImageReference(characterId);
      if (imagePath) {
        // Supprimer le fichier
        const fileInfo = await FileSystem.getInfoAsync(imagePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(imagePath);
        }

        // Supprimer la référence
        await this.removeImageReference(characterId);
        
        console.log('✅ Character image removed');
      }
    } catch (error) {
      console.error('❌ Error removing character image:', error);
      throw new Error('Failed to remove character image');
    }
  }

  /**
   * Sauvegarde la référence d'une image dans AsyncStorage
   */
  private async saveImageReference(characterId: number, imagePath: string): Promise<void> {
    try {
      const existingReferences = await this.getAllImageReferences();
      existingReferences[characterId.toString()] = imagePath;
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(existingReferences)
      );
    } catch (error) {
      console.error('❌ Error saving image reference:', error);
      throw error;
    }
  }

  /**
   * Récupère la référence d'une image depuis AsyncStorage
   */
  private async getImageReference(characterId: number): Promise<string | null> {
    try {
      const references = await this.getAllImageReferences();
      return references[characterId.toString()] || null;
    } catch (error) {
      console.error('❌ Error getting image reference:', error);
      return null;
    }
  }

  /**
   * Supprime une référence d'image
   */
  private async removeImageReference(characterId: number): Promise<void> {
    try {
      const references = await this.getAllImageReferences();
      delete references[characterId.toString()];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(references)
      );
    } catch (error) {
      console.error('❌ Error removing image reference:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les références d'images
   */
  private async getAllImageReferences(): Promise<Record<string, string>> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error getting all image references:', error);
      return {};
    }
  }

  /**
   * Nettoie les images orphelines (fichiers sans référence)
   */
  async cleanupOrphanedImages(): Promise<void> {
    try {
      const references = await this.getAllImageReferences();
      const referencedPaths = new Set(Object.values(references));

      // Lister tous les fichiers dans le répertoire d'images
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(this.IMAGES_DIR);
      
      for (const file of files) {
        const filePath = `${this.IMAGES_DIR}${file}`;
        
        // Si le fichier n'est pas référencé, le supprimer
        if (!referencedPaths.has(filePath)) {
          await FileSystem.deleteAsync(filePath);
          console.log('🧹 Cleaned up orphaned image:', file);
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up orphaned images:', error);
    }
  }

  /**
   * Obtient la taille totale des images stockées
   */
  async getTotalImageSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) return 0;

      const files = await FileSystem.readDirectoryAsync(this.IMAGES_DIR);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${this.IMAGES_DIR}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && typeof fileInfo.size === 'number') {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('❌ Error calculating total image size:', error);
      return 0;
    }
  }

  /**
   * Formate la taille en bytes en format lisible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const imageService = new ImageService();