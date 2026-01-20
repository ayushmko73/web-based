import React, { useState, useEffect, useCallback } from 'react';
import { Delete, Moon, Sun, History } from 'lucide-react';

// Utility to format numbers with commas
const formatOperand = (operand: string) => {
  if (operand === '') return '';
  const [integer, decimal] = operand.split('.');
  if (decimal == null) {
    return new Intl.NumberFormat('en-US').format(parseFloat(integer));
  }
  return `${new Intl.NumberFormat('en-US').format(parseFloat(integer))}.${decimal}`;
};

export default function App() {
  const [currentOperand, setCurrentOperand] = useState<string>('0');
  const [previousOperand, setPreviousOperand] = useState<string>('');
  const [operation, setOperation] = useState<string | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle Dark Mode Toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const clear = () => {
    setCurrentOperand('0');
    setPreviousOperand('');
    setOperation(undefined);
  };

  const deleteNumber = () => {
    if (currentOperand === '0') return;
    if (currentOperand.length === 1) {
      setCurrentOperand('0');
    } else {
      setCurrentOperand(currentOperand.slice(0, -1));
    }
  };

  const appendNumber = (number: string) => {
    if (number === '.' && currentOperand.includes('.')) return;
    if (currentOperand === '0' && number !== '.') {
      setCurrentOperand(number);
    } else {
      setCurrentOperand(currentOperand + number);
    }
  };

  const chooseOperation = (op: string) => {
    if (currentOperand === '0' && previousOperand === '') return;
    if (previousOperand !== '') {
      calculate();
    }
    setOperation(op);
    setPreviousOperand(currentOperand);
    setCurrentOperand('0');
  };

  const calculate = () => {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          alert("Cannot divide by zero");
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Handle floating point precision issues
    computation = Math.round(computation * 1000000000) / 1000000000;

    const logEntry = `${formatOperand(previousOperand)} ${operation} ${formatOperand(currentOperand)} = ${formatOperand(computation.toString())}`;
    setHistory(prevHistory => [logEntry, ...prevHistory].slice(0, 10)); // Keep last 10

    setCurrentOperand(computation.toString());
    setOperation(undefined);
    setPreviousOperand('');
  };

  // Keyboard Support
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '=' || e.key === 'Enter') { 
      e.preventDefault(); 
      calculate(); 
    }
    if (e.key === 'Backspace') deleteNumber();
    if (e.key === 'Escape') clear();
    if (e.key === '+' || e.key === '-') chooseOperation(e.key);
    if (e.key === '*') chooseOperation('×');
    if (e.key === '/') {
      e.preventDefault();
      chooseOperation('÷');
    }
  }, [currentOperand, previousOperand, operation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800/50">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            >
              <History size={20} />
            </button>
            <h1 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Calculator
            </h1>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        {/* Display */}
        <div className="p-6 flex flex-col items-end justify-end h-32 break-all">
          <div className="text-slate-400 dark:text-slate-400 text-sm h-6 mb-1 font-mono">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="text-4xl font-bold text-slate-800 dark:text-white font-mono">
            {formatOperand(currentOperand)}
          </div>
        </div>

        {/* History Overlay */}
        {showHistory && (
          <div className="absolute top-16 left-0 w-full h-[calc(100%-4rem)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-10 p-4 transition-all">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold dark:text-white">History</h2>
               <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:underline">Clear All</button>
             </div>
             <div className="space-y-2 overflow-y-auto max-h-[350px]">
               {history.length === 0 ? (
                 <p className="text-center text-gray-500 dark:text-slate-400 mt-10">No history yet</p>
               ) : (
                 history.map((item, idx) => (
                   <div key={idx} className="p-2 border-b border-gray-100 dark:border-slate-700 text-right text-gray-700 dark:text-slate-300 font-mono">
                     {item}
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-700">
          {/* Row 1 */}
          <ActionButton onClick={clear} className="col-span-2 text-red-500 dark:text-red-400 bg-gray-50 dark:bg-slate-800">AC</ActionButton>
          <ActionButton onClick={deleteNumber} className="bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Delete size={20} />
          </ActionButton>
          <ActionButton onClick={() => chooseOperation('÷')} className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xl font-bold">÷</ActionButton>

          {/* Row 2 */}
          <NumButton num="7" onClick={() => appendNumber('7')} />
          <NumButton num="8" onClick={() => appendNumber('8')} />
          <NumButton num="9" onClick={() => appendNumber('9')} />
          <ActionButton onClick={() => chooseOperation('×')} className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xl font-bold">×</ActionButton>

          {/* Row 3 */}
          <NumButton num="4" onClick={() => appendNumber('4')} />
          <NumButton num="5" onClick={() => appendNumber('5')} />
          <NumButton num="6" onClick={() => appendNumber('6')} />
          <ActionButton onClick={() => chooseOperation('-')} className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xl font-bold">-</ActionButton>

          {/* Row 4 */}
          <NumButton num="1" onClick={() => appendNumber('1')} />
          <NumButton num="2" onClick={() => appendNumber('2')} />
          <NumButton num="3" onClick={() => appendNumber('3')} />
          <ActionButton onClick={() => chooseOperation('+')} className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xl font-bold">+</ActionButton>

          {/* Row 5 */}
          <NumButton num="0" onClick={() => appendNumber('0')} className="col-span-2 rounded-bl-3xl" />
          <ActionButton onClick={() => appendNumber('.')} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-xl">.</ActionButton>
          <ActionButton onClick={calculate} className="bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 rounded-br-3xl text-xl font-bold">=</ActionButton>
        </div>
      </div>
    </div>
  );
}

// Sub-components for buttons to keep code clean

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const ActionButton = ({ onClick, children, className = '' }: ButtonProps) => (
  <button 
    onClick={onClick}
    className={`h-16 md:h-20 flex items-center justify-center active:opacity-70 transition-opacity outline-none focus:ring-2 focus:ring-inset focus:ring-orange-200 dark:focus:ring-slate-500 ${className}`}
  >
    {children}
  </button>
);

const NumButton = ({ num, onClick, className = '' }: { num: string, onClick: () => void, className?: string }) => (
  <button 
    onClick={onClick}
    className={`h-16 md:h-20 bg-white dark:bg-slate-800 text-2xl font-medium text-slate-700 dark:text-slate-200 active:bg-gray-100 dark:active:bg-slate-700 transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-blue-100 dark:focus:ring-slate-600 ${className}`}
  >
    {num}
  </button>
);