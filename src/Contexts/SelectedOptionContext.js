import { useState, createContext } from 'react';
import PropTypes from 'prop-types';

export const SelectedOptionContext = createContext({});

export function SelectedOptionProvider({ children }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const value = {
    selectedOption,
    setSelectedOption,
  };

  return (
    <SelectedOptionContext.Provider value={value}>
      {children}
    </SelectedOptionContext.Provider>
  );
}

SelectedOptionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
