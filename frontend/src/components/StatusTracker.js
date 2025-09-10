export default function StatusTracker({ status = 'reported' }) {
  const statuses = [
    { key: 'reported', label: 'Reported', icon: '📝' },
    { key: 'assigned', label: 'Assigned', icon: '👤' },
    { key: 'resolved', label: 'Resolved', icon: '✅' }
  ];

  const getCurrentStep = () => {
    const statusMap = { 'reported': 0, 'assigned': 1, 'resolved': 2 };
    return statusMap[status.toLowerCase()] || 0;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        {statuses.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 transition-colors ${
                index <= currentStep
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-200 text-gray-500 border-gray-300'
              }`}
            >
              {step.icon}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300 -translate-y-1/2"></div>
        <div
          className="absolute top-6 left-6 h-0.5 bg-blue-600 transition-all duration-500 -translate-y-1/2"
          style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }}
        ></div>
      </div>

      {/* Status description */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Current Status: {statuses[currentStep].label}</h3>
        <p className="text-gray-600 text-sm">
          {currentStep === 0 && "Your report has been submitted and is pending review."}
          {currentStep === 1 && "Your report has been assigned to a team member for resolution."}
          {currentStep === 2 && "Your report has been resolved. Thank you for helping improve the community!"}
        </p>
      </div>
    </div>
  );
}
