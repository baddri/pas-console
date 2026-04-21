import { DocumentTitle, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { Content, PageSection, Label, Divider } from '@patternfly/react-core';
import { PageHeader } from '@patternfly/react-component-groups';
import { ComplianceCheckResultKind, ComplianceCheckResultModel } from '../types/ComplianceCheckResult';
import { useMemo, useState } from 'react';
import { ComplianceScoreChart } from '../modules/compliance/ComplianceScoreChart';
import { ComplianceResultChart } from '../modules/compliance/ComplianceResultChart';
import { ComplianceSeverityChart } from '../modules/compliance/ComplianceSeverityChart';
import { ComplianceResultTable } from '../modules/compliance/ComplianceCheckResultKind';
import { ComplianceCheckResultDrawer } from '../modules/compliance/ComplianceCheckResultDrawer';

import '../styles/base.css';

interface ComplianceResultData {
  status: string;
  x: string;
  y: number;
  label: string;
}

export default function CompliancePage() {
  const { t } = useTranslation('plugin__console-plugin-template');

  const [data, loaded] = useK8sWatchResource<ComplianceCheckResultKind[]>({
    groupVersionKind: {
      group: ComplianceCheckResultModel.apiGroup,
      version: ComplianceCheckResultModel.apiVersion,
      kind: ComplianceCheckResultModel.kind,
    },
    isList: true,
  });

  const compliancePercentage = useMemo(() => {
    if (!loaded || !data?.length) return 0;
    const passed = data.filter((v) => v.metadata.labels['compliance.openshift.io/check-status'] === 'PASS').length;
    return (passed / data.length) * 100;
  }, [data, loaded]);

  const { failData, passData, manualData } = useMemo(() => {
    if (!loaded || !data?.length) {
      return { failData: [], passData: [], manualData: [] };
    }

    const result = {
      failData: [] as ComplianceResultData[],
      passData: [] as ComplianceResultData[],
      manualData: [] as ComplianceResultData[],
    };

    const suiteCount: Record<string, Record<string, number>> = {};

    data.forEach((v) => {
      const suite = v.metadata.labels['compliance.openshift.io/suite'];
      const status = v.metadata.labels['compliance.openshift.io/check-status'];
      if (!suiteCount[suite]) suiteCount[suite] = {};
      suiteCount[suite][status] = (suiteCount[suite][status] ?? 0) + 1;
    });

    data.forEach((v) => {
      const suite = v.metadata.labels['compliance.openshift.io/suite'];
      const status = v.metadata.labels['compliance.openshift.io/check-status'];
      const entry: ComplianceResultData = { status, x: suite, y: suiteCount[suite][status], label: '' };

      if (status === 'FAIL') result.failData.push({ ...entry, label: 'Fail: ' + entry.y });
      if (status === 'PASS') result.passData.push({ ...entry, label: 'Pass: ' + entry.y });
      if (status === 'MANUAL') result.manualData.push({ ...entry, label: 'Manual: ' + entry.y });
    });

    return result;
  }, [data, loaded]);

  const severityChartData = useMemo(() => {
    if (!loaded || !data?.length) {
      return { chartData: [], legendData: [] };
    }

    const counts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    data
      .filter((v) => v.metadata.labels['compliance.openshift.io/check-status'] !== 'PASS')
      .forEach((v) => {
        const severity = v.metadata.labels['compliance.openshift.io/check-severity'];
        if (severity in counts) counts[severity]++;
      });

    const chartData = [
      { x: 'Critical', y: counts.critical },
      { x: 'High', y: counts.high },
      { x: 'Medium', y: counts.medium },
      { x: 'Low', y: counts.low },
    ];

    const legendData = chartData.map((d) => ({ name: `${d.x}: ${d.y}` }));

    return { chartData, legendData };
  }, [data, loaded]);

  const [selectedRow, setSelectedRow] = useState<ComplianceCheckResultKind | null>(null);

  return (
    <>
      <ComplianceCheckResultDrawer selected={selectedRow} onClose={() => setSelectedRow(null)}>
        <DocumentTitle>{t('Cluster Compliance')}</DocumentTitle>
        <PageHeader
          title="Cluster Compliance"
          subtitle="Continuous compliance monitoring for your OpenShift cluster by PAS Team"
          label={<Label className="pf-v5-u-align-content-center">Pas Admin</Label>}
        />
        <Divider />
        <PageSection>
          <Content>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                alignItems: 'stretch',
              }}
            >
              <ComplianceScoreChart compliancePercentage={compliancePercentage} total={data?.length ?? 0} />
              <ComplianceResultChart failData={failData} passData={passData} manualData={manualData} />
              <ComplianceSeverityChart
                chartData={severityChartData.chartData}
                legendData={severityChartData.legendData}
              />
            </div>
          </Content>
        </PageSection>
        <ComplianceResultTable
          data={loaded && data?.length ? data : []}
          onRowClick={setSelectedRow}
          selectedRow={selectedRow}
        />
      </ComplianceCheckResultDrawer>
    </>
  );
}
