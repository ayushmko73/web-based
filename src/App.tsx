import { useState, useEffect, useCallback } from 'react';
import { Delete, Calculator } from 'lucide-react';

type Operator = '+' | '-' | '*' | '/' | null;

export default function App() {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [history, setHistory] = useState<string>('');

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHistory('');
  };

  const performOperation = (nextOperator: Operator) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const currentValue = firstOperand || 0;
      const newValue = calculate(currentValue, inputValue, operator);
      
      setDisplay(String(newValue));
      setFirstOperand(newValue);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    
    // Update history display
    if (nextOperator) {
        setHistory(firstOperand === null 
            ? `${inputValue} ${nextOperator}` 
            : `${firstOperand} ${operator} ${inputValue} ${nextOperator}`);
    }
  };

  const calculate = (first: number, second: number, op: Operator): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second === 0 ? 0 : first / second;
      default: return second;
    }
  };

  const handleEqual = () => {
    if (!operator || firstOperand === null) return;

    const inputValue = parseFloat(display);
    const result = calculate(firstOperand, inputValue, operator);
    
    setDisplay(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(true);
    setHistory('');
  };

  const handleBackspace = () => {
    if (waitingForSecondOperand) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  // Keyboard support
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;

    if (/[0-9]/.test(key)) {
      inputDigit(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      performOperation(key as Operator);
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      handleEqual();
    } else if (key === 'Backspace') {
      handleBackspace();
    } else if (key === 'Escape') {
      clear();
    }
  }, [display, firstOperand, operator, waitingForSecondOperand]); // Dependencies for closure

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "default" 
  }: { 
    children: React.ReactNode, 
    onClick: () => void, 
    className?: string,
    variant?: "default" | "action" | "accent"
  }) => {
    const baseStyles = "h-16 text-2xl font-semibold rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm";
    
    const variants = {
      default: "bg-white hover:bg-gray-50 text-gray-800",
      action: "bg-blue-100 hover:bg-blue-200 text-blue-600",
      accent: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
    };

    return (
      <button 
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gray-50 p-4 flex items-center gap-2 border-b border-gray-100">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-700">Calculator</span>
        </div>

        {/* Display */}
        <div className="p-6 flex flex-col items-end gap-1 bg-white">
          <div className="h-6 text-sm text-gray-400 font-medium">
            {history || (operator && firstOperand !== null ? `${firstOperand} ${operator}` : '')}
          </div>
          <div className="text-5xl font-bold text-gray-800 tracking-tight overflow-hidden text-ellipsis w-full text-right">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-3">
            <Button onClick={clear} variant="action">AC</Button>
            <Button onClick={() => performOperation('/')} variant="action">÷</Button>
            <Button onClick={() => performOperation('*')} variant="action">×</Button>
            <Button onClick={handleBackspace} variant="action">
                <Delete className="w-6 h-6" />
            </Button>

            <Button onClick={() => inputDigit('7')}>7</Button>
            <Button onClick={() => inputDigit('8')}>8</Button>
            <Button onClick={() => inputDigit('9')}>9</Button>
            <Button onClick={() => performOperation('-')} variant="action">-</Button>

            <Button onClick={() => inputDigit('4')}>4</Button>
            <Button onClick={() => inputDigit('5')}>5</Button>
            <Button onClick={() => inputDigit('6')}>6</Button>
            <Button onClick={() => performOperation('+')} variant="action">+</Button>

            <Button onClick={() => inputDigit('1')}>1</Button>
            <Button onClick={() => inputDigit('2')}>2</Button>
            <Button onClick={() => inputDigit('3')}>3</Button>
            
            <div className="row-span-2 flex">
                 <Button 
                    onClick={handleEqual} 
                    variant="accent"
                    className="h-full w-full"
                 >
                    =
                 </Button>
            </div>

            <Button onClick={() => inputDigit('0')} className="col-span-2">0</Button>
            <Button onClick={inputDecimal}>.</Button>
          </div>
        </div>
      </div>
    </div>
  );
}