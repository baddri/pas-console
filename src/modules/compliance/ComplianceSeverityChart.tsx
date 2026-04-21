import { Card, CardTitle, CardBody, Title } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts/victory';
import * as React from 'react';

interface SeverityData {
  x: string;
  y: number;
}

interface LegendData {
  name: string;
}

interface ComplianceSeverityChartProps {
  chartData: SeverityData[];
  legendData: LegendData[];
}

export const ComplianceSeverityChart: React.FC<ComplianceSeverityChartProps> = ({ chartData, legendData }) => {
  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <CardTitle>
        <Title headingLevel="h4" size="lg">
          Severity Breakdown
        </Title>
      </CardTitle>
      <CardBody>
        <ChartDonut
          ariaDesc="Compliance check results by severity"
          ariaTitle="Severity donut chart"
          constrainToVisibleArea
          data={chartData}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
          legendData={legendData}
          legendOrientation="vertical"
          legendPosition="right"
          colorScale={['#C9190B', '#EC7A08', '#F0AB00', '#3E8635']}
          name="severity-chart"
          padding={{ bottom: 10, left: 20, right: 140, top: 10 }}
          subTitle="fails"
          title={String(chartData.reduce((acc, d) => acc + d.y, 0))}
          width={350}
        />
      </CardBody>
    </Card>
  );
};
