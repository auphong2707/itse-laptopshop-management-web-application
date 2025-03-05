import React from 'react';
import { Tabs, Image, ConfigProvider } from 'antd';
import ProductSlider from './ProductSlider';

const { TabPane } = Tabs;

const TabProductSlider = ({tabLabels, tabBanners, tabProductData}) => {
	return (
		<ConfigProvider
			theme={{
				components: {
					Tabs: {
						itemHoverColor: 'rgb(51, 51, 51)',
						itemSelectedColor: 'black',
						itemActiveColor: 'black',
						itemColor: 'grey'
					}
				}
		}}>
			<Tabs>
				{tabLabels.map((tabName, index) => (
					<TabPane 
						tab={tabName}
						key={index}
					>
						<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
							<Image 
								src={tabBanners[index]} 
								alt={tabName} width="228px"
								height="345px"
								style={{display:"block"}}
								preview={false}
							/>
							<ProductSlider productData={tabProductData[index]} />
						</div>
					</TabPane>
				))}
			</Tabs>
		</ConfigProvider>
	);
}

export default TabProductSlider;