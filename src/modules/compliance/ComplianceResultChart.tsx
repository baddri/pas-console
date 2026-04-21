import { Card, CardTitle, CardBody, Title } from '@patternfly/react-core';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartTooltip } from '@patternfly/react-charts/victory';
import * as React from 'react';

interface ComplianceResultData {
  status: string;
  x: string;
  y: number;
  label: string;
}

interface ComplianceResultChartProps {
  failData: ComplianceResultData[];
  passData: ComplianceResultData[];
  manualData: ComplianceResultData[];
}

export const ComplianceResultChart: React.FC<ComplianceResultChartProps> = ({ failData, passData, manualData }) => {
  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h4" size="lg">
          Compliance Baseline Results
        </Title>
      </CardTitle>
      <CardBody>
        <Chart
          ariaDesc="Compliance results per suite"
          ariaTitle="Compliance suite bar chart"
          domainPadding={{ x: [30, 25] }}
          legendPosition="bottom"
          height={255}
          name="compliance-suite-chart"
          padding={{ bottom: 30, left: 50, right: 50, top: 30 }}
          width={450}
        >
          <ChartAxis />
          <ChartAxis dependentAxis showGrid />
          <ChartGroup offset={15}>
            <ChartBar themeColor="red" data={failData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
            <ChartBar themeColor="green" data={passData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
            <ChartBar themeColor="blue" data={manualData} labelComponent={<ChartTooltip constrainToVisibleArea />} />
          </ChartGroup>
        </Chart>
      </CardBody>
    </Card>
  );
};
