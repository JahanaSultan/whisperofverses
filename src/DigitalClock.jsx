import { useState, useEffect } from 'react';

const DigitalClock = (props) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));

  useEffect(() => {
    const intervalID = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour12: false }));
    }, 1000);
    return () => clearInterval(intervalID);
  }, []);

  return (
    <div id="clock">
      <p>{time}</p>
      <p>{props.weekday}</p>
    </div>
  );
};

export default DigitalClock;
