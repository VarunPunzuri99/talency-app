// Accordion.js
import React, { useState } from 'react';
import styles from './index.module.scss';

function CustomAccordion({ children }) {
  return <div className={styles.accordion}>{children}</div>;
}

function AccordionItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.accordionItem}>
      <div className={styles.accordionHeader} onClick={toggleAccordion}>
        <div>{title}</div>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
}

export { CustomAccordion, AccordionItem };
