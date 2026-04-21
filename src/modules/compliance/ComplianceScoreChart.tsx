import { Card, CardTitle, CardBody, Title } from '@patternfly/react-core';
import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts/victory';
import * as React from 'react';

interface ComplianceScoreChartProps {
  compliancePercentage: number;
  total: number;
}

export const ComplianceScoreChart: React.FC<ComplianceScoreChartProps> = ({ compliancePercentage, total }) => {
  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h4" size="lg">
          Compliance Score
        </Title>
      </CardTitle>
      <CardBody>
        <ChartDonutThreshold
          constrainToVisibleArea
          data={[
            { x: 'Danger at 50%', y: 50 },
            { x: 'Warning at 75%', y: 75 },
            { x: 'Comply at 90%', y: 100 },
          ]}
          height={200}
          labels={({ datum }) => (datum.x ? datum.x : null)}
          padding={{ bottom: 0, left: 20, right: 170, top: 10 }}
          width={350}
          colorScale={['red', 'yellow', 'blue']}
        >
          <ChartDonutUtilization
            data={{ x: 'Compliance Score', y: compliancePercentage.toFixed(2) }}
            labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}%` : null)}
            legendData={[{ name: 'Comply' }, { name: 'Warning at 75%' }, { name: 'Danger at 50%' }]}
            colorScale={['blue', 'yellow', 'red']}
            legendOrientation="vertical"
            title={compliancePercentage.toFixed(2) + ' %'}
            subTitle={'of total ' + total}
            thresholds={[{ value: 60 }, { value: 90 }]}
          />
        </ChartDonutThreshold>
      </CardBody>
    </Card>
  );
};
