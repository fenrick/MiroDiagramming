/** Utility to read a file as UTF-8 text. */
export const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        reject('Failed to load file');
        return;
      }
      resolve(e.target.result as string);
    };
    reader.onerror = () => reject('Failed to load file');
    reader.readAsText(file, 'utf-8');
  });
