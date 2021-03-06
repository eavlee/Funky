import React, { PropTypes } from 'react'
import { Adv } from './adv.jsx'
import { MediaSlider } from './common/media-slider.jsx'
import { ShotListItem } from './common/shot-list-item.jsx'
import { Banner } from './common/banner.jsx'
import { ListFilter } from './common/list-filter.jsx'
import { SampleConfig } from './config/sample-config'

/**
组件结构
<Sample> <= styles,scenes,list
  <MediaSlider /> <= advs
  <Banner /> <-SampleConfig.Banner
  <ListFilter />
  <SampleList>
    <ShotListItem />
  </SampleList>
</Sample>

**/

/**/
const SampleList = React.createClass({
  render () {
    return (
      <div className="samples-list">
        <div className="screening-results">
          <span className="find"><span>找到作品</span><b className='J_Count'>{this.props.totalPage}</b><span>套</span></span>
        </div>
        <ShotListItem {...SampleConfig['ShotListItem']} />
      </div>
    )
  },
  propTypes: {
    totalPage: React.PropTypes.number,
  },
  getDefaultProps(){
    return {
      totalPage:6
    }
  }
})
/** main **/
const Sample = React.createClass({
  render () {
    return (
      <div className='samples-view ypxs-view'>
        <div className="bannar-all-box">
          <div id="slider_top" className="slider-box bannar" style={{height:'450px'}}>
            <MediaSlider {...SampleConfig['MediaSlider']} />
          </div>
        </div>
        <div className="layout-center-box">
          <Banner {...SampleConfig['Banner'][0]} />
          <div className="filter-title J_Tab">
            <span className="sel">婚纱摄影</span>
            <span className="sel sec nnn">艺术写真</span>
          </div>
          <div className='J_FilterCtrl' onClick={this.toggleFun}>
            <ListFilter title={'风格'} name={'styleName'} klass={'ico-1-js ico-1-2-js'} valueKey={['styleId']} conditions={this.state.styles} sorterKey={['styleId']} />
            <ListFilter title={'场景'} name={'addressName'} klass={'ico-1-js ico-1-3-js'} valueKey={['addressId']} conditions={this.state.scenes} sorterKey={['addressId']} />
          </div>
          <SampleList />
          <div onClick={this.loadMore} id="J_MoreButton">
            <div className="more-btn"><span>点击查看更多</span></div>
          </div>
        </div>
        </div>
    )
  },
  getInitialState(){
    return (
      {
        styles:[],
        scenes:[]
      }
    )
  }


})
export { Sample }
