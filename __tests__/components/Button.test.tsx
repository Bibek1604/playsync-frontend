import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui';

describe('Button Component', () => {
    it('renders correctly with given text', () => {
        // 1. Arrange & Act
        render(<Button>Click Me</Button>);

        // 2. Assert
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);

        const btn = screen.getByText('Click Me');
        fireEvent.click(btn);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when isLoading is true', () => {
        render(<Button isLoading>Submit</Button>);
        // Look for button as disabled 
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
