import DashboardLayout from './DashboardLayout';

// Layout variants for different page types
export const DashboardLayoutVariants = {
  // Standard dashboard layout
  default: (props) => <DashboardLayout {...props} />,
  
  // Full-width layout (no sidebar padding)
  fullWidth: (props) => (
    <DashboardLayout 
      {...props} 
      className="lg:pl-0" 
    />
  ),
  
  // Centered content layout
  centered: ({ children, ...props }) => (
    <DashboardLayout {...props}>
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </DashboardLayout>
  ),
  
  // Wide content layout
  wide: ({ children, ...props }) => (
    <DashboardLayout {...props}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </DashboardLayout>
  ),
  
  // Narrow content layout (for forms, etc.)
  narrow: ({ children, ...props }) => (
    <DashboardLayout {...props}>
      <div className="max-w-2xl mx-auto">
        {children}
      </div>
    </DashboardLayout>
  ),
};