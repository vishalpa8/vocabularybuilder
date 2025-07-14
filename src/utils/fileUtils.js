export const downloadJson = (data, filename) => {
  const replacer = (key, value) => {
    if (['id', 'streak', 'lastReviewed', 'nextReview'].includes(key)) {
      return undefined;
    }
    return value;
  };
  const json = JSON.stringify(data, replacer, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const uploadJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        resolve(json);
      } catch {
        reject('Invalid JSON file');
      }
    };
    reader.onerror = () => {
      reject('Error reading file');
    };
    reader.readAsText(file);
  });
};