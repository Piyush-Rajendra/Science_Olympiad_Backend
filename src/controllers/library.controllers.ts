import { Request, Response } from 'express';
import pool from '../../config/db.config';
import multer from 'multer';
import { IResourceLibrary, IQandA } from '../models/library.model'; // Adjust the import based on your project structure
import { RowDataPacket } from 'mysql2';

// Configure multer for file uploads
const storage = multer.memoryStorage();
// Configure multer for file uploads with a size limit of 4GB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 16 MB limit
});


// Function to upload or update a PDF for a given schoolGroup_id
export const uploadOrUpdatePDF = async (req: Request, res: Response) => {
    const { schoolGroup_id } = req.body;
    const pdfFile = req.file;

    // Validate input
    if (!pdfFile) {
        return res.status(400).json({ message: 'PDF file is required' });
    }
    if (!schoolGroup_id) {
        return res.status(400).json({ message: 'schoolGroup_id is required' });
    }

    try {
        const pdfData: Buffer = pdfFile.buffer; // Ensure pdfData is treated as Buffer

        // Check if an entry already exists for the given schoolGroup_id
        const [rows]: [RowDataPacket[], any] = await pool.execute(
            'SELECT * FROM resourcelibrary WHERE schoolGroup_id = ?',
            [schoolGroup_id]
        );

        const existingEntry = rows as IResourceLibrary[];

        if (existingEntry.length > 0) {
            // Update the existing entry with the new PDF data
            await pool.execute(
                'UPDATE resourcelibrary SET pdf_input = ? WHERE schoolGroup_id = ?',
                [pdfData, schoolGroup_id]
            );

            res.status(200).json({ message: 'PDF updated successfully' });
        } else {
            // Insert a new entry if none exists for the given schoolGroup_id
            const [result]: any = await pool.execute(
                'INSERT INTO resourcelibrary (schoolGroup_id, pdf_input) VALUES (?, ?)',
                [schoolGroup_id, pdfData]
            );

            res.status(201).json({ message: 'PDF uploaded successfully', resourceLibrary_id: result.insertId });
        }
    } catch (error) {
        console.error('Error uploading or updating PDF:', error);
        res.status(500).json({ message: 'Error uploading or updating PDF', error: error.message });
    }
};

// Function to get a PDF by schoolGroup_id
export const getPDFBySchoolGroupId = async (req: Request, res: Response) => {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);

    // Validate input
    if (isNaN(schoolGroup_id)) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }

    try {
        // Query the database for the PDF
        const [rows]: [RowDataPacket[], any] = await pool.execute(
            'SELECT pdf_input FROM resourcelibrary WHERE schoolGroup_id = ?',
            [schoolGroup_id]
        );

        const result = rows as IResourceLibrary[];

        if (result.length === 0) {
            return res.status(404).json({ message: 'No PDF found for the given schoolGroup_id' });
        }

        const pdfData: Buffer = result[0].pdf_input as unknown as Buffer; // Ensure pdfData is treated as Buffer

        // Set appropriate headers for sending the PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=school_${schoolGroup_id}_document.pdf`);

        // Send the binary data of the PDF
        res.status(200).send(pdfData);
    } catch (error) {
        console.error('Error retrieving PDF:', error);
        res.status(500).json({ message: 'Error retrieving PDF', error: error.message });
    }
};

// Middleware for handling file uploads with multer
export const uploadMiddleware = upload.single('pdf');


// Create a question
export const createQuestion = async (req: Request, res: Response) => {
  const { schoolGroup_id, Question } = req.body;

  // Validate input
  if (!schoolGroup_id || !Question) {
      return res.status(400).json({ message: 'schoolGroup_id and Question are required' });
  }

  try {
      const createdOn = new Date();
      const isAnswered = 0; // Question is initially unanswered

      const [result]: any = await pool.execute(
          'INSERT INTO QandA (schoolGroup_id, Question, isAnswered, createdOn, lastUpdated) VALUES (?, ?, ?, ?, ?)',
          [schoolGroup_id, Question, isAnswered, createdOn, createdOn]
      );

      res.status(201).json({
          message: 'Question created successfully',
          QandA_id: result.insertId
      });
  } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ message: 'Error creating question', error: error.message });
  }
};

// Delete a question
export const deleteQuestion = async (req: Request, res: Response) => {
  const QandA_id = parseInt(req.params.QandA_id);

  // Validate input
  if (!QandA_id) {
      return res.status(400).json({ message: 'Invalid QandA_id' });
  }

  try {
      const [result]: any = await pool.execute(
          'DELETE FROM QandA WHERE QandA_id = ?',
          [QandA_id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

// Add an answer to a question
export const addAnswer = async (req: Request, res: Response) => {
  const QandA_id = parseInt(req.params.QandA_id);
  const { Answer } = req.body;

  // Validate input
  if (!QandA_id || !Answer) {
      return res.status(400).json({ message: 'QandA_id and Answer are required' });
  }

  try {
      const lastUpdated = new Date();

      const [update]: any = await pool.execute(
          'UPDATE QandA SET Answer = ?, isAnswered = 1, lastUpdated = ? WHERE QandA_id = ?',
          [Answer, lastUpdated, QandA_id]
      );

      if (update.affectedRows === 0) {
          return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({ message: 'Answer added successfully' });
  } catch (error) {
      console.error('Error adding answer:', error);
      res.status(500).json({ message: 'Error adding answer', error: error.message });
  }
};

// Get a question by QandA_id
export const getQuestion = async (req: Request, res: Response) => {
  const QandA_id = parseInt(req.params.QandA_id);

  // Validate input
  if (!QandA_id) {
      return res.status(400).json({ message: 'Invalid QandA_id' });
  }

  try {
      const [result]: any = await pool.execute(
          'SELECT * FROM QandA WHERE QandA_id = ?',
          [QandA_id]
      );

      if (result.length === 0) {
          return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json(result[0]);
  } catch (error) {
      console.error('Error retrieving question:', error);
      res.status(500).json({ message: 'Error retrieving question', error: error.message });
  }
};

// Get answers for a schoolGroup_id
export const getAnswersBySchoolGroupId = async (req: Request, res: Response) => {
  const schoolGroup_id = parseInt(req.params.schoolGroup_id);

  // Validate input
  if (!schoolGroup_id) {
      return res.status(400).json({ message: 'Invalid schoolGroup_id' });
  }

  try {
      const [result]: any = await pool.execute(
          'SELECT * FROM QandA WHERE schoolGroup_id = ? AND isAnswered = 1',
          [schoolGroup_id]
      );

      if (result.length === 0) {
          return res.status(404).json({ message: 'No answered questions found for the given schoolGroup_id' });
      }

      res.status(200).json(result);
  } catch (error) {
      console.error('Error retrieving answers:', error);
      res.status(500).json({ message: 'Error retrieving answers', error: error.message });
  }
};

// Edit a question
export const editQuestion = async (req: Request, res: Response) => {
    const QandA_id = parseInt(req.params.QandA_id);
    const { Question } = req.body;
  
    // Validate input
    if (!QandA_id || !Question) {
        return res.status(400).json({ message: 'QandA_id and Question are required' });
    }
  
    try {
        const lastUpdated = new Date();
  
        const [update]: any = await pool.execute(
            'UPDATE QandA SET Question = ?, lastUpdated = ? WHERE QandA_id = ?',
            [Question, lastUpdated, QandA_id]
        );
  
        if (update.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
  
        res.status(200).json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error('Error editing question:', error);
        res.status(500).json({ message: 'Error editing question', error: error.message });
    }
};

  // Edit an answer
export const editAnswer = async (req: Request, res: Response) => {
    const QandA_id = parseInt(req.params.QandA_id);
    const { Answer } = req.body;
  
    // Validate input
    if (!QandA_id || !Answer) {
        return res.status(400).json({ message: 'QandA_id and Answer are required' });
    }
  
    try {
        const lastUpdated = new Date();
  
        const [update]: any = await pool.execute(
            'UPDATE QandA SET Answer = ?, lastUpdated = ? WHERE QandA_id = ?',
            [Answer, lastUpdated, QandA_id]
        );
  
        if (update.affectedRows === 0) {
            return res.status(404).json({ message: 'Answer not found' });
        }
  
        res.status(200).json({ message: 'Answer updated successfully' });
    } catch (error) {
        console.error('Error editing answer:', error);
        res.status(500).json({ message: 'Error editing answer', error: error.message });
    }
};
  
// Get an answer by QandA_id
export const getAnswerByQandAId = async (req: Request, res: Response) => {
    const QandA_id = parseInt(req.params.QandA_id);

    // Validate input
    if (isNaN(QandA_id)) {
        return res.status(400).json({ message: 'Invalid QandA_id' });
    }

    try {
        const [result]: any = await pool.execute(
            'SELECT Answer FROM QandA WHERE QandA_id = ?',
            [QandA_id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'No answer found for the given QandA_id' });
        }

        res.status(200).json(result[0]); // Return the answer found
    } catch (error) {
        console.error('Error retrieving answer:', error);
        res.status(500).json({ message: 'Error retrieving answer', error: error.message });
    }
};

// Get all questions by schoolGroup_id
export const getQuestionsBySchoolGroupId = async (req: Request, res: Response) => {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);

    // Validate input
    if (isNaN(schoolGroup_id)) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }

    try {
        const [result]: [RowDataPacket[], any] = await pool.execute(
            'SELECT * FROM QandA WHERE schoolGroup_id = ?',
            [schoolGroup_id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'No questions found for the given schoolGroup_id' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ message: 'Error retrieving questions', error: error.message });
    }
};

// Function to delete a PDF by schoolGroup_id
export const deletePDF = async (req: Request, res: Response) => {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);

    // Validate input
    if (isNaN(schoolGroup_id)) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }

    try {
        // Check if a PDF exists for the given schoolGroup_id
        const [rows]: [RowDataPacket[], any] = await pool.execute(
            'SELECT * FROM resourcelibrary WHERE schoolGroup_id = ?',
            [schoolGroup_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No PDF found for the given schoolGroup_id' });
        }

        // Delete the PDF entry from the database
        const [result]: any = await pool.execute(
            'DELETE FROM resourcelibrary WHERE schoolGroup_id = ?',
            [schoolGroup_id]
        );

        res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        console.error('Error deleting PDF:', error);
        res.status(500).json({ message: 'Error deleting PDF', error: error.message });
    }
};

