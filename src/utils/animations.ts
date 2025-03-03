
// Animation presets for consistent transitions
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  slideIn: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.4 }
  },
  
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  // For staggered children animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.3 }
  }
};

// Function to apply a subtle hover effect to cards and buttons
export const applyHoverEffect = (element: HTMLElement) => {
  element.addEventListener('mouseenter', () => {
    element.style.transform = 'translateY(-2px)';
    element.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
    element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  });
  
  element.addEventListener('mouseleave', () => {
    element.style.transform = 'translateY(0)';
    element.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  });
};

// Ripple effect for buttons
export const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
  const button = event.currentTarget;
  
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');
  
  const ripple = button.getElementsByClassName('ripple')[0];
  
  if (ripple) {
    ripple.remove();
  }
  
  button.appendChild(circle);
};
