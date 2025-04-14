import { builtinModules, createRequire } from 'module';

// Cache storage.
const cache = new Map<string, boolean>();

/**
 * Checks if a package is installed in the specified project.
 *
 * @param {string} moduleName - The name of the package to check.
 * @returns {boolean} - Returns true if the package is installed, or if it is a native Node module; otherwise, returns false.
 */
export function isPackageInstalled(moduleName: string): boolean {
  // Normaliza el nombre para evitar duplicados en caché por formato
  const normalizedName = moduleName.trim();
  
  // Revisa caché primero
  if (cache.has(normalizedName)) {
    return cache.get(normalizedName)!;
  }

  // Si es un módulo nativo de Node, no pierdas el tiempo
  if (builtinModules.includes(normalizedName) || builtinModules.includes(normalizedName.replace(/^node:/, ''))) {
    cache.set(normalizedName, true);
    return true;
  }

  try {
    const require = createRequire(import.meta.url);
    require.resolve(normalizedName);
    cache.set(normalizedName, true);
    return true;
  } catch (error: any) {
    // Este es el momento en que deberías tratar distintos tipos de error
    // pero como típico juniorputo lo ignoras todo con un catch vacío
    // Al menos revisemos si es un error de "module not found" vs otras mierdas
    switch (error.code) {
      case 'MODULE_NOT_FOUND':
      case 'ERR_PACKAGE_PATH_NOT_EXPORTED':
        break;

      default:
        console.warn(`Error inesperado verificando "${normalizedName}": ${error.message}`);
        break;
    }
    
    cache.set(normalizedName, false);
    return false;
  }
}