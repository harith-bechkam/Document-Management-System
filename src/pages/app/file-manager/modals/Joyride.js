import React, { useState } from 'react';
import Joyride from 'react-joyride';

const JoyrideComp = ({ steps, run, setRun }) => {
    return (
        <Joyride
            steps={steps}
            run={run} 
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            callback={(data) => {
                if (data.status === "finished" || data.status === "skipped") {
                    setRun(false); 
                }
            }}
            styles={{
                options: {
                    zIndex: 10000000,
                },
                beacon: {
                    display: "none",
                }
            }}
        />
    );
};

export default JoyrideComp;
