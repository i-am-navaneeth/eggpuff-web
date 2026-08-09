import { pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc =
  '/pdf/pdf.worker.min.mjs'

export default pdfjs