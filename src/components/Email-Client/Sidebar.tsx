// Sidebar.js
import styles from './EmailClient.module.scss';

const Sidebar = ({ folders, onSelectFolder }) => {
  return (
    <div className={styles.sidebar}>
      {folders.map((folder) => (
        <div
          key={folder}
          className={styles.folder}
          onClick={() => onSelectFolder(folder)}
        >
          {folder}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
