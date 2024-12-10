import styles from './index.module.scss';


interface TitleBarProps {
    title: string;
    departmentType?: string;
    children?: React.ReactNode;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, departmentType, children }) => {
    return (
        <div className={`${styles.bar} ${children ? '' : styles.center}`}>
            <div className={styles.title}>
                {title}
                {departmentType && (
                    <span className={styles.departmentType}> - {departmentType}</span>
                )}
            </div>
            {children && <div>{children}</div>}
        </div>
    );
};

export default TitleBar;
interface FilterBarProps {
    children?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children }) => {
    return (
        <div className={styles.filter_bar}>
            {children}
        </div>
    );
};