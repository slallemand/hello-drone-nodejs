import React, {
    PureComponent
} from 'react';
import "./controlPanel.scss";
import "./checkbox.scss";
import cx from "classnames";


const defaultContainer = ({children}) => <div className="control-panel">{children}</div>;

export default class StyleControls extends PureComponent {

  _renderLayerControl(controllableLayer) {
    
    return (
      <div key={controllableLayer.regex} className="inputLayer">
        <label className="checkbox-label">
            <input
              type="checkbox"
              checked={this.props.layers[controllableLayer.regex].value}
              onChange = {
                (evt) => this.props.onChange(controllableLayer.regex, evt)
              }
            />
            <span className="checkbox-custom circular"></span>
        </label>
        < div className = {
          cx("legend", {
            "legend--blue": controllableLayer.regex.includes('flood-extended'),
            "legend--orange": controllableLayer.regex.includes('roads'),
          })
        } >
            {controllableLayer.label}
        </div>
      </div>
    );
  }

  render() {
    const Container = this.props.containerComponent || defaultContainer;
    return (
      <Container>
      <div  className="controlPanel__container">
        <h4>
          <label>Layers</label>
        </h4>
        <div className='inputsContainer'>
          {
            this.props.categories.map(controllableLayer => this._renderLayerControl(controllableLayer))
          }
        </div>
      </div>
      </Container>
    );
  }
}
