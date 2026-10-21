export function publicReport(report) {
  return {
    id: report._id,
    reportType: report.reportType,
    title: report.title,
    description: report.description,
    category: report.category,
    broadLocation: report.broadLocation,
    eventDate: report.eventDate,
    status: report.status,
    createdAt: report.createdAt
  };
}
