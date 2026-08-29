import '@testing-library/jest-dom'

// jsdom не реализует Blob.arrayBuffer(), а серверные экшены читают через него
// загруженные файлы. Без полифилла uploadPhoto/createPost падают на
// "file.arrayBuffer is not a function".
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function arrayBuffer() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}
