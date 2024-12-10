import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import styles from './index.module.scss';

const FreelancerPage = () => {
  return (
    <Droppable droppableId="freelancer-page">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${styles.freelancerContainer} ${
            snapshot.isDraggingOver ? styles.draggingOver : ''
          }`}
        >
          <p className={styles.placeholderText}>Drop jobs here for freelancers</p>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default FreelancerPage;
