import express, { Request, Response } from 'express';
import pool from '../../config/db.config';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for uploading a PDF
app.post('/upload-pdf', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    const { schoolGroup_id } = req.body;
    const pdfFile = req.file;

    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    // Validate input
    if (!pdfFile) {
      return res.status(400).json({ message: 'PDF file is required' });
    }
    if (!schoolGroup_id) {
      return res.status(400).json({ message: 'schoolGroup_id is required' });
    }

    // Get the binary data from the file
    const pdfData = pdfFile.buffer;

    // Check if a record already exists for this schoolGroup_id
    const [existingRecord] = await pool.execute(
      'SELECT * FROM resource_library WHERE schoolGroup_id = ?',
      [schoolGroup_id]
    ) as any[];

    if (existingRecord.length > 0) {
      // Update the existing record with the new PDF
      await pool.execute(
        'UPDATE resource_library SET pdf_input = ? WHERE schoolGroup_id = ?',
        [pdfData, schoolGroup_id]
      );
      res.status(200).json({ message: 'PDF updated successfully' });
    } else {
      // Insert a new record if none exists
      const [result] = await pool.execute(
        'INSERT INTO resource_library (schoolGroup_id, pdf_input) VALUES (?, ?)',
        [schoolGroup_id, pdfData]
      );
      res.status(201).json({ message: 'PDF uploaded successfully', id: (result as any).insertId });
    }
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ message: 'Error uploading PDF', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
