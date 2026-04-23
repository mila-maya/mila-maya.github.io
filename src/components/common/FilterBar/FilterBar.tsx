import styles from './FilterBar.module.css';

export interface FilterOption<TId extends string = string> {
  id: TId;
  label: string;
}

interface FilterBarProps<TId extends string = string> {
  options: FilterOption<TId>[];
  activeId: TId;
  onChange: (id: TId) => void;
  ariaLabel: string;
}

const FilterBar = <TId extends string = string>({
  options,
  activeId,
  onChange,
  ariaLabel,
}: FilterBarProps<TId>) => {
  return (
    <div className={styles.filters} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`${styles.filter} ${isActive ? styles.filterActive : ''}`}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
