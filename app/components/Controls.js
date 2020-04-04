import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Controls = ({ playing, onClick }) => {
  let playpause;
  if (!playing) {
    playpause = <i id="play" onClick={onClick} className="fa fa-fw fa-play" />;
  } else {
    playpause = <i id="pause" onClick={onClick} className="fa fa-fw fa-pause" />;
  }

  return (
    <div className="Controls">
      {playpause}
    </div>
  );
};

Controls.propTypes = {
  onClick: PropTypes.func.isRequired,
  playing: PropTypes.bool
};

Controls.defaultProps = {
  playing: false
};

export default Controls;
