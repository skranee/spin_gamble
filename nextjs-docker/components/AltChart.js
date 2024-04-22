import styles from '../styles/components/AltChart.module.scss';
import { ReactComponent as RocketShip } from '../public/Crash-Icons/rocketship.svg';

function AltChart(props) {
  const axisXLength = [0, props.width];
  const axisYLength = [0, props.height];
  const xDefault = 6;
  const yDefault = 90;
  const xMax =
    props.data[props.data.length - 1].time > xDefault
      ? props.data[props.data.length - 1].time
      : xDefault; // We want the max x value to be the time value of the last data point or 12
  const xMin = 0;
  const yMax =
    props.data[props.data.length - 1].value * 2 > yDefault
      ? props.data[props.data.length - 1].value * 2
      : yDefault; // We want the max y value to be the "value" value of the last dataPoint or 90
  const yMin = 0; // We want the y axis to start at 0
  const xScaleFactor = axisXLength[1] / (xMax - xMin);
  const yScaleFactor = axisYLength[1] / (yMax - yMin);

  const mappedDataPoints = mapDataToSvgCoordinates(props.data);
  const svgPath = calculatePath(mappedDataPoints);

  function mapDataToSvgCoordinates(dataPoints) {
    return dataPoints.map((dataPoint) => {
      return {
        x: dataPoint.time * xScaleFactor,
        y: axisYLength[1] - dataPoint.value * yScaleFactor,
        time: dataPoint.time,
        value: dataPoint.value
      };
    });
  }

  function calculatePath(dataPoints) {
    return dataPoints.reduce((generated, dataPoint, i) => {
      if (i === 0) return generated;
      console.log(generated, dataPoint);
      return `${generated} L ${dataPoint.x} ${dataPoint.y - 30}`;
    }, `M 0 ${dataPoints[0].y - 30}`);
  }

  function calculateXAxis(dataPoints) {
    return dataPoints.reduce((generated, dataPoint, i) => {
      if (i === 0) return generated;

      return `${generated} M ${dataPoint.x} ${dataPoint.y} L ${dataPoint.x} ${
        dataPoint.y - 10
      } M ${dataPoint.x} ${dataPoint.y}`;
    }, `M 0 ${dataPoints[0].y}`);
  }

  function calculateYAxis(dataPoints) {
    return dataPoints.reduce((generated, dataPoint, i) => {
      if (i === 0) return generated;

      return `${generated} M ${dataPoint.x} ${dataPoint.y} L ${
        dataPoint.x + 10
      } ${dataPoint.y} M ${dataPoint.x} ${dataPoint.y}`;
    }, `M 0 ${dataPoints[0].y}`);
  }

  let xAxisLines;
  let xCoordinates;
  if (props.data[props.data.length - 1].time <= 12) {
    xCoordinates = mapDataToSvgCoordinates([
      { time: 3, value: 0 },
      { time: 6, value: 0 },
      { time: 9, value: 0 },
      { time: 12, value: 0 }
    ]);
    xAxisLines = calculateXAxis(xCoordinates);
  } else {
    xCoordinates = mapDataToSvgCoordinates([
      { time: 3, value: 0 },
      { time: 6, value: 0 },
      { time: 9, value: 0 },
      { time: 12, value: 0 },
      { time: 15, value: 0 },
      { time: 18, value: 0 }
    ]);
    xAxisLines = calculateXAxis(xCoordinates);
  }

  let yAxisLines;
  let yCoordinates;
  const topValue = props.data[props.data.length - 1].value;
  if (topValue <= 90) {
    yCoordinates = mapDataToSvgCoordinates([
      { time: 0, value: 30 },
      { time: 0, value: 60 },
      { time: 0, value: 90 },
      { time: 0, value: 120 },
      { time: 0, value: 150 }
    ]);
    yAxisLines = calculateYAxis(yCoordinates);
  } else {
    //91 -> .91 -> 1 -> 100
    yCoordinates = mapDataToSvgCoordinates([
      { time: 0, value: Math.round((topValue * 0.5) / 100) * 100 },
      { time: 0, value: Math.round(topValue / 100) * 100 },
      { time: 0, value: Math.round((topValue * 1.5) / 100) * 100 },
      { time: 0, value: Math.round((topValue * 2) / 100) * 100 }
    ]);
    yAxisLines = calculateYAxis(yCoordinates);
  }

  function Text(props) {
    const sizeOfLetter = 10.25;
    const sizeOfNumbers = [
      15.75, 8.3333, 12.9833, 12.9167, 14.35, 12.9833, 13.5333, 12.6, 13.2,
      13.5333
    ];

    const heightOfLetters = 33.0167;

    const adjustedX = props.isX
      ? props.x -
        (sizeOfLetter + sizeOfNumbers[Number(props.time.toString()[0])] / 2)
      : props.x;

    return (
      <text
        x={adjustedX}
        y={props.isX ? props.y : props.y + heightOfLetters / 4}
        style={
          props.isX
            ? {
                fill: '#4A4D65',
                fontSize: 24,
                fontWeight: 400
              }
            : {
                fill: '#CFCFCF',
                fontSize: 24,
                fontWeight: 400
              }
        }>
        {props.isX ? props.time : props.value}
        {props.isX ? 's' : 'x'}
      </text>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.textContainer}>
        <span style={props.playAnimation ? { fontSize: 64 } : {}}>
          {props.crashed
            ? 'Crashed'
            : props.playAnimation
            ? `${Math.round(props.multiplier * 100) / 100}x`
            : 'Round begin in '}
        </span>
        {props.playAnimation || props.crashed ? (
          <></>
        ) : (
          <span>{props.time}</span>
        )}
      </div>
      <svg
        className={styles.mainChart}
        height={axisYLength[1]}
        width={axisXLength[1]}>
        {<path d={xAxisLines} stroke="blue" fill="none" />}
        {xCoordinates.map((coordinate, index) => (
          <Text
            x={coordinate.x}
            y={coordinate.y}
            time={coordinate.time}
            value={coordinate.value}
            isX
            key={`xText-${index + 1}`}
          />
        ))}

        {<path d={yAxisLines} stroke="red" fill="none" />}
        {yCoordinates.map((coordinate, index) => (
          <Text
            x={coordinate.x}
            y={coordinate.y}
            time={coordinate.time}
            value={coordinate.value}
            key={`yText-${index + 1}`}
          />
        ))}

        <path d={svgPath} fill="none" stroke="none" />
        <defs>
          <linearGradient
            id="paint"
            x1="3"
            y1="176.5"
            x2="855"
            y2="176.5"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#8A57DE" />
            <stop offset="1" stopColor="#DEAFBD" />
          </linearGradient>
        </defs>
        <path fill="none" stroke="url(#paint)" strokeWidth="5" d={svgPath} />
        {
          <g
            className={
              props.playAnimation
                ? `${styles.rocketShip} ${styles.animate}`
                : styles.rocketShip
            }>
            <RocketShip
              x={mappedDataPoints[mappedDataPoints.length - 1].x - 100}
              y={mappedDataPoints[mappedDataPoints.length - 1].y - 50}
            />
          </g>
        }
      </svg>
    </div>
  );
}

export default AltChart;
