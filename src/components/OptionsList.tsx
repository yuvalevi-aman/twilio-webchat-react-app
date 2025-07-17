import React from 'react';
import classes from "./styles/OptionsList.module.scss";

interface OptionsListProps {
    options: string[];
    onOptionSelect: (option: string) => void;
    buttonClassName?: string;
    type?: "button" | "submit";
    [key: string]: any;
}

const OptionsList: React.FC<OptionsListProps> = ({
    options,
    onOptionSelect,
    buttonClassName,
    type = "button",
    ...props
}) => {
    return (
        <div className={classes.optionList}>
            {options.map((option, index) => (
                <button
                    key={index}
                    className={`${classes.baseButton} ${buttonClassName || ''}`}
                    onClick={() => onOptionSelect(option)}
                    type={type}
                    {...props}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};

export default OptionsList;
