// Fungsi untuk menghasilkan warna random yang konsisten per index
const palette = [
  '#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#607d8b',
  '#e91e63', '#00bcd4', '#ffc107', '#8bc34a', '#f44336',
  '#3f51b5', '#009688', '#cddc39', '#ff5722', '#673ab7',
  '#2196f3', '#ffeb3b', '#795548', '#607d8b', '#bdbdbd'
];
export function randomColor(idx) {
  return palette[idx % palette.length];
} 