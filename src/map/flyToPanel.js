import "./flyToPanel.scss";
import React, {PureComponent} from 'react';
import Collapse from "@kunukn/react-collapse";
import cx from "classnames";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

export default class FlyToPanel extends PureComponent {

  _buildDropdownOptions = () => {
      const options = []
      for (const city in this.props.data) {
        options.push({
          type: 'group',
          name: city,
          items: this.props.data[city].map(item => ({
            ...item,
            label: `${item.city} - ${item.neighborhood}`,
            value: JSON.stringify({event: city, value: item.value, id: Math.random()})
          }))
        })
      }
      return options
  }

  options = this._buildDropdownOptions()

  state = {
    isOpen: false,
    current: this.props.data[this.props.defaultEvent][0].value,
    eventName: this.props.data[this.props.defaultEvent][0].eventName,
    date: this.props.data[this.props.defaultEvent][0].date,
    selected: this.options[0].items[0]
  };

  toggle = () => {
    let collapse = "isOpen";
    this.setState(prevState => (
        {
          ...prevState,
          [collapse]: !prevState[collapse]
        }
    ));
  };

    handleSelect = (item) => {
      const currentEvent = JSON.parse(item.value)
      const selectedArea = this.props.data[currentEvent.event].find(area => area.value === currentEvent.value)
      this.props.onViewportChange(selectedArea)

      this.setState(prevState => ({
        ...prevState,
        current: item.value,
        selected: item,
        eventName: selectedArea.eventName,
        date: selectedArea.date
      }));

      if (this.state.current !== item.value) {
        this.toggle()
      }

    }

  render() {
    return (
      <div className="flyToPanel">
        <button
          className={cx("flyToPanel__toggle", {
            "flyToPanel__toggle--active": this.state.isOpen
          })}
          onClick={() => this.toggle()}
        >
          <label className="flyToPanel__toggle-text">
            <span className="flyToPanel__toggle-text__app-name">DISASTER INSIGHT</span> <span className="flyToPanel__toggle-text__team-name">by AXA REV</span>
          </label>
          <div className="rotate90">
            <svg
              className={cx("icon", { "icon--expanded": this.state.isOpen })}
              viewBox="6 0 12 24"
            >
              <polygon points="8 0 6 1.8 14.4 12 6 22.2 8 24 18 12" />
            </svg>
          </div>
        </button>
        <Collapse
          className={cx("flyToPanel__collapseContainer", {
            "flyToPanel__collapseContainer--active": this.state.isOpen
          })}
          isOpen={this.state.isOpen}
        >
          <h4>
            <label>
              Location
              <span className="emojiSpacerLeft" role="img" aria-label="Emoji Map">
                🗺️
              </span>
            </label>
          </h4>
          <Dropdown
            className="locationDropdown"
            controlClassName="locationDropdown__control"
            options={this.options}
            onChange={this.handleSelect}
            value={this.state.selected}
            placeholder="Select an option"
          />
          <div className="flyToPanel__collapseContainerEvent">
            <h4>
              <label>
                Event
                <span className="emojiSpacerLeft" role="img" aria-label="Emoji Calendar">
                  📆
                </span>
              </label>
            </h4>
            <div className="eventLabels">{this.state.eventName}</div>
            <div className="eventLabels">{this.state.date}</div>
          </div>
          <h4>
            <label>
              Get in touch
              <span className="emojiSpacerLeft" role="img" aria-label="Emoji Wave">
                👋
              </span>
            </label>
          </h4>
          <div>
            <span className="emojiSpacerRight" role="img" aria-label="Emoji email">
              ✉️
            </span>
            <a className="emailContactLink" href="mailto:aurelien.francois@axa.com?subject=Wants%20to%20know%20more%20about%20disaster%20insight%20by%20AXA%20REV">
              Aurelien FRANCOIS
            </a>
          </div>
          <div>
            <span className="emojiSpacerRight" role="img" aria-label="Emoji email">
              ✉️
            </span>
            <a className="emailContactLink" href="mailto:patrick.jayet@axa.com?subject=Wants%20to%20know%20more%20about%20disaster%20insight%20by%20AXA%20REV">
              Patrick JAYET
            </a>
          </div>
        </Collapse>
      </div>
    );
  }
}
