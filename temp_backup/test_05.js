const prevRollingList = [7.0, 7.5, 8.0, 8.5];
const incAmount = 0.5;

prevRollingList.forEach(prevRolling => {
    let rollingTotal = prevRolling + incAmount;
    let cross1 = Math.floor((prevRolling - 0.001) / 8) < Math.floor((rollingTotal - 0.001) / 8);
    let cross2 = Math.floor((prevRolling - 1) / 8) < Math.floor((rollingTotal - 1) / 8);

    console.log(`prev: ${prevRolling}, curr: ${rollingTotal} | cross(0.001): ${cross1} | cross(1): ${cross2}`);
});
