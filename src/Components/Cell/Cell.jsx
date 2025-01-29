
import './index.css';
import React, { useState, useEffect, useRef } from 'react';

const Cell = ({ x, y, value: initialValue, onChangedValue, executeFormula }) => {
    console.log('====================================');
    console.log(initialValue, x, y);
    console.log('====================================');
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [display, setDisplay] = useState(determineDisplay({ x, y }, initialValue));
  const timer = useRef(0);
  const delay = 200;
  const prevent = useRef(false);

  useEffect(() => {
    const handleUnselectAll = () => {
      if (selected || editing) {
        setSelected(false);
        setEditing(false);
      }
    };

    window.document.addEventListener('unselectAll', handleUnselectAll);

    return () => {
      window.document.removeEventListener('unselectAll', handleUnselectAll);
    };
  }, [selected, editing]);

  useEffect(() => {
    setDisplay(determineDisplay({ x, y }, value));
  }, [value, x, y]);

  useEffect(() => {
    setValue(initialValue)
  },[initialValue])
  
  function determineDisplay({ x, y }, value) {
    if (value.slice(0, 1) === '=') {
      const res = executeFormula({ x, y }, value.slice(1));
      if (res.error !== null) {
        return 'INVALID';
      }
      return res.result;
    }
    return value;
  };

  const emitUnselectAllEvent = () => {
    const unselectAllEvent = new Event('unselectAll');
    window.document.dispatchEvent(unselectAllEvent);
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onKeyPressOnInput = (e) => {
    if (e.key === 'Enter') {
      hasNewValue(e.target.value);
    }
  };

  const onKeyPressOnSpan = () => {
    if (!editing) {
      setEditing(true);
    }
  };

  const onBlur = (e) => {
    hasNewValue(e.target.value);
  };

  const hasNewValue = (value) => {
    onChangedValue({ x, y }, value);
    setEditing(false);
  };

  const clicked = () => {
    timer.current = setTimeout(() => {
      if (!prevent.current) {
        emitUnselectAllEvent();
        setSelected(true);
      }
      prevent.current = false;
    }, delay);
  };

  const doubleClicked = () => {
    clearTimeout(timer.current);
    prevent.current = true;
    emitUnselectAllEvent();
    setSelected(true);
    setEditing(true);
  };

  const calculateCss = () => {
    const css = {
      width: '80px',
      padding: '4px',
      margin: '0',
      height: '25px',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'inline-block',
      color: 'black',
      border: '1px solid #cacaca',
      textAlign: 'left',
      verticalAlign: 'top',
      fontSize: '14px',
      lineHeight: '15px',
      overflow: 'hidden',
      fontFamily: "Calibri, 'Segoe UI', Thonburi, Arial, Verdana, sans-serif",
    };
    if (x === 0 || y === 0) {
      css.textAlign = 'center';
      css.backgroundColor = '#f0f0f0';
      css.fontWeight = 'bold';
    }
    if (selected) {
      css.outlineColor = 'lightblue';
      css.outlineStyle = 'dotted';
    }
    return css;
  };

  let css = 'cell';
  if (x === 0 || y === 0) {
    css += ' cell-default'  }
  if (selected) {
    css += ' selected'
  }
  if (x === 0) {
    return <span className={css}>{y}</span>;
  }

  if (y === 0) {
    const alpha = ' abcdefghijklmnopqrstuvwxyz'.split('');
    return (
      <span
        onKeyPress={onKeyPressOnSpan}
        className={css}
        role="presentation"
      >
        {alpha[x]}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        className={css}
        type="text"
        onBlur={onBlur}
        onKeyPress={onKeyPressOnInput}
        value={value}
        onChange={onChange}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={clicked}
      onDoubleClick={doubleClicked}
      className={css}
      role="presentation"
    >
      {display}
    </span>
  );
};

export default Cell;