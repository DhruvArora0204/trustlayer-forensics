import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "../types";

export const generatePDF = (caseId: string, data: AnalysisResult, imageSrc: string | null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // -- Header --
  doc.setFillColor(9, 9, 11); // Zinc-950
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TrustLayer Report", 15, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170); // Zinc-400
  doc.text(`Case ID: ${caseId}`, 15, 30);
  doc.text(`Date: ${new Date().toLocaleString()}`, pageWidth - 15, 30, { align: 'right' });

  // -- Executive Summary --
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 15, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Conclusion: ${data.summary.finalConclusion}`, 15, 65, { maxWidth: pageWidth - 30 });
  
  const rec = data.summary.recommendation;
  let recColor = [245, 158, 11]; // Amber
  if (rec === 'Approve') recColor = [16, 185, 129]; // Emerald
  if (rec === 'Reject') recColor = [244, 63, 94]; // Rose

  doc.text(`AI Recommendation:`, 15, 80);
  doc.setTextColor(recColor[0], recColor[1], recColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(rec.toUpperCase(), 50, 80);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Confidence Score: ${data.summary.confidenceScore}%`, 100, 80);
  doc.text(`Fraud Risk Score: ${data.fraud.riskScore}/100`, 150, 80);

  let currentY = 90;

  // -- Evidence Image --
  if (imageSrc) {
    try {
      const imgProps = doc.getImageProperties(imageSrc);
      const pdfImgWidth = 120;
      const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
      
      // Check if image fits on page, if not, new page
      if (currentY + pdfImgHeight > 280) {
        doc.addPage();
        currentY = 20;
      }

      doc.setDrawColor(200, 200, 200);
      doc.rect(14, currentY - 1, pdfImgWidth + 2, pdfImgHeight + 2);
      doc.addImage(imageSrc, 'JPEG', 15, currentY, pdfImgWidth, pdfImgHeight);
      currentY += pdfImgHeight + 15;
    } catch (e) {
      console.warn("Could not add image to PDF", e);
      doc.text("[Image Processing Error]", 15, currentY);
      currentY += 10;
    }
  }

  // -- Details Tables --
  
  // Forensics
  autoTable(doc, {
    startY: currentY,
    head: [['Forensic Attribute', 'Value']],
    body: [
      ['Device', data.forensics.deviceModel],
      ['Software Signature', data.forensics.software],
      ['GPS Coordinates', data.forensics.gpsCoordinates],
      ['Capture Time', data.forensics.captureTime],
      ['Environment', data.forensics.visualEnvironment]
    ],
    theme: 'grid',
    headStyles: { fillColor: [39, 39, 42] }, // Zinc-800
    styles: { fontSize: 9 },
    margin: { top: 10 }
  });

  // Insurance
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Insurance Assessment', 'Details']],
    body: [
      ['Vehicle ID', data.insurance.vehicleId],
      ['Impact Type', data.insurance.impactType],
      ['Damage Class', data.insurance.damageClass],
      ['Total Estimated Cost', `₹${data.insurance.totalEstimatedCost.toLocaleString('en-IN')}`],
      ['Notes', data.insurance.notes]
    ],
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11] }, // Amber-500
    styles: { fontSize: 9 }
  });

  // Fraud
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Fraud Analysis', 'Details']],
    body: [
      ['Risk Score', `${data.fraud.riskScore}/100`],
      ['Anomalies', data.fraud.anomalies.join(', ') || 'None Detected'],
      ['Details', data.fraud.details]
    ],
    theme: 'grid',
    headStyles: { fillColor: [244, 63, 94] }, // Rose-500
    styles: { fontSize: 9 }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Confidential Forensic Report - TrustLayer Inc. - Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`TrustLayer_Case_${caseId}.pdf`);
};