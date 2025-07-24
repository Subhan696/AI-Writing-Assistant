/**
 * A utility function to conditionally join class names together
 * @param {...any} classes - Class names to join
 * @returns {string} - Joined class names
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export { cn };
