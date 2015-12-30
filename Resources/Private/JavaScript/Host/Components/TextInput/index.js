import React, {Component, PropTypes} from 'react';
import uuid from 'uuid';
import mergeClassNames from 'classnames';
import Label from '../Label/';
import style from './style.css';

export default class TextInput extends Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        className: PropTypes.string,
        isValid: PropTypes.bool.isRequired
    }

    render() {
        const {
            label,
            placeholder,
            className,
            isValid
        } = this.props;
        const classNames = mergeClassNames({
            [className]: className && className.length,
            [style.textInput]: true
        });
        const id = uuid.v1();

        return (
            <div className={classNames}>
                <Label htmlFor={id} label={label} />
                <input
                    className={style.textInput__input}
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    />
            </div>
        );
    }
}
