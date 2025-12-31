/**
 * Brochure Generator for Courses
 * Generates a 3-page PDF brochure for courses
 */

import jsPDF from 'jspdf';

interface CourseData {
  title: string;
  courseType?: string;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
  description?: string | null;
  learningObjectives?: string[] | null;
  targetAudience?: string | null;
  methodology?: string | null;
  hrdcClaimable?: boolean;
  schedule?: Array<{
    dayNumber: number;
    startTime: string;
    endTime: string;
    moduleTitle: string;
    submoduleTitle?: string | null;
  }>;
}

export const generateCourseBrochure = async (course: CourseData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const rightMargin = 30; // Right margin for content on first page
  const contentWidth = pageWidth - (margin + rightMargin);

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, fontStyle: string = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // ============================================================================
  // PAGE 1: COVER PAGE WITH BACKGROUND IMAGE
  // ============================================================================
  
  // Load and add background image
  try {
    // Convert image to base64 for jsPDF
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Use a promise to wait for image to load and convert to base64
    await new Promise((resolve) => {
      img.onload = () => {
        try {
          // Create canvas to convert image to base64
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            // Add image as background covering entire page
            doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
            resolve(true);
          } else {
            throw new Error('Could not get canvas context');
          }
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          // Fallback to colored background if image fails
          doc.setFillColor(230, 240, 255);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          resolve(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        // Fallback to colored background
        doc.setFillColor(230, 240, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        resolve(false);
      };
      // Try to load from public folder
      img.src = '/Brochure Pic.png';
    });
  } catch (error) {
    console.error('Error loading background image:', error);
    // Fallback to colored background
    doc.setFillColor(230, 240, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Calculate date text for reuse
  let dateText = 'TBA';
  if (course.startDate) {
    const startDate = new Date(course.startDate);
    if (course.endDate && course.endDate !== course.startDate) {
      const endDate = new Date(course.endDate);
      dateText = `${startDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      dateText = startDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  // Course type mapping
  const courseTypeMap: { [key: string]: string } = {
    'IN_HOUSE': 'In-House',
    'PUBLIC': 'Public',
    'VIRTUAL': 'Virtual',
  };

  // Course title - positioned higher and more to the right in the middle section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(28); // Increased font size
  doc.setFont('helvetica', 'bold');
  const titleMaxWidth = contentWidth - 30; // Extra margin for title
  const titleLines = doc.splitTextToSize(course.title, titleMaxWidth);
  const titleY = 110; // Moved up from 130
  const titleX = margin + 30; // Moved to the right
  doc.text(titleLines, titleX, titleY);

  // Course details - positioned below title, moved up and to the right with larger fonts
  let yPos = titleY + (titleLines.length * 7) + 12; // Moved up
  doc.setFontSize(13); // Increased from 11
  doc.setFont('helvetica', 'normal');
  const detailX = margin + 30; // Moved to the right

  // Training Mode
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Training Mode:', detailX, yPos);
  doc.setFont('helvetica', 'normal');
  const modeText = courseTypeMap[course.courseType || 'IN_HOUSE'] || course.courseType || 'In-House';
  doc.text(modeText, detailX + 50, yPos);
  yPos += 10;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Date:', detailX, yPos);
  doc.setFont('helvetica', 'normal');
  const dateLines = doc.splitTextToSize(dateText, contentWidth - 80);
  doc.text(dateLines, detailX + 50, yPos);
  yPos += Math.max(dateLines.length * 6, 10) + 2;

  // Venue
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Venue:', detailX, yPos);
  doc.setFont('helvetica', 'normal');
  const venueText = course.venue || 'TBA';
  const venueLines = doc.splitTextToSize(venueText, contentWidth - 80);
  doc.text(venueLines, detailX + 50, yPos);

  // Footer contact info (already on image, but ensure it's visible)
  doc.setFillColor(0, 51, 102, 0.9); // Semi-transparent overlay for readability
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Phone: +019 9331 008', margin, pageHeight - 12);
  doc.text('Email: enquiry@klgreens.com', margin + 80, pageHeight - 12);
  doc.text('Website: www.klgreens.com', margin + 160, pageHeight - 12);

  // ============================================================================
  // PAGE 2: COURSE DETAILS
  // ============================================================================
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  let currentY = margin;

  // Header
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('COURSE INFORMATION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  // Topic, Date, Venue table
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  const rowHeight = 8;
  const col1Width = 40;
  const col2Width = contentWidth - col1Width;

  // Topic row
  doc.rect(margin, currentY, col1Width, rowHeight);
  doc.rect(margin + col1Width, currentY, col2Width, rowHeight);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOPIC', margin + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(course.title, margin + col1Width + 2, currentY + 5);
  currentY += rowHeight;

  // Date row
  doc.rect(margin, currentY, col1Width, rowHeight);
  doc.rect(margin + col1Width, currentY, col2Width, rowHeight);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', margin + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(dateText, margin + col1Width + 2, currentY + 5);
  currentY += rowHeight;

  // Venue row
  doc.rect(margin, currentY, col1Width, rowHeight);
  doc.rect(margin + col1Width, currentY, col2Width, rowHeight);
  doc.setFont('helvetica', 'bold');
  doc.text('VENUE', margin + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(course.venue || 'TBA', margin + col1Width + 2, currentY + 5);
  currentY += rowHeight;

  // Certificate row (only if HRDC claimable)
  if (course.hrdcClaimable) {
    doc.rect(margin, currentY, col1Width, rowHeight);
    doc.rect(margin + col1Width, currentY, col2Width, rowHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE', margin + 2, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('CERTIFICATE OF ATTENDANCE', margin + col1Width + 2, currentY + 5);
    currentY += rowHeight;
  }

  currentY += 15;

  // Introduction
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Introduction:', margin, currentY);
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (course.description) {
    currentY = addText(course.description, margin, currentY, contentWidth, 10);
  } else {
    currentY += 5;
  }
  currentY += 10;

  // Course Objectives
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Course Objectives:', margin, currentY);
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (course.learningObjectives && course.learningObjectives.length > 0) {
    course.learningObjectives.forEach((obj) => {
      doc.text(`• ${obj}`, margin + 5, currentY);
      currentY += 6;
    });
  } else {
    doc.text('N/A', margin + 5, currentY);
    currentY += 6;
  }
  currentY += 10;

  // Target Audience
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Target Audience:', margin, currentY);
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (course.targetAudience) {
    currentY = addText(course.targetAudience, margin, currentY, contentWidth, 10);
  } else {
    doc.text('N/A', margin, currentY);
    currentY += 6;
  }
  currentY += 10;

  // Methodology
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Methodology:', margin, currentY);
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (course.methodology) {
    currentY = addText(course.methodology, margin, currentY, contentWidth, 10);
  } else {
    doc.text('N/A', margin, currentY);
    currentY += 6;
  }

  // ============================================================================
  // PAGE 3: COURSE SCHEDULE
  // ============================================================================
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  currentY = margin;

  // Header
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('COURSE SCHEDULE', pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  if (course.schedule && course.schedule.length > 0) {
    // Group schedule by day
    const scheduleByDay: { [day: number]: typeof course.schedule } = {};
    course.schedule.forEach(item => {
      if (!scheduleByDay[item.dayNumber]) {
        scheduleByDay[item.dayNumber] = [];
      }
      scheduleByDay[item.dayNumber].push(item);
    });

    // Display schedule by day
    Object.keys(scheduleByDay).sort((a, b) => parseInt(a) - parseInt(b)).forEach(day => {
      const dayItems = scheduleByDay[parseInt(day)];
      
      // Day header
      doc.setFillColor(0, 51, 102);
      doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${day}`, margin + 5, currentY + 7);
      currentY += 12;

      // Schedule items for this day
      dayItems.forEach(item => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY, contentWidth, 20, 'S');

        // Time
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.startTime} - ${item.endTime}`, margin + 5, currentY + 7);

        // Module title
        doc.setFont('helvetica', 'bold');
        doc.text(item.moduleTitle, margin + 5, currentY + 14);

        // Submodule title (if exists)
        if (item.submoduleTitle) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(item.submoduleTitle, margin + 5, currentY + 19);
        }

        currentY += 22;
      });

      currentY += 5; // Space between days
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Schedule to be announced', pageWidth / 2, currentY + 20, { align: 'center' });
  }

  // Save the PDF
  const fileName = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_brochure.pdf`;
  doc.save(fileName);
};

