import { K8sModel, K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export type ComplianceStatus = 'PASS' | 'FAIL' | 'MANUAL' | 'INFO' | 'INCONSISTENT';
export type ComplianceSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceCheckResultKind extends K8sResourceKind {
  apiVersion: 'compliance.openshift.io/v1alpha1';
  kind: 'ComplianceCheckResult';
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    resourceVersion: string;
    generation: number;
    creationTimestamp: string;
    labels: {
      'compliance.openshift.io/check-severity': ComplianceSeverity;
      'compliance.openshift.io/check-status': ComplianceStatus;
      'compliance.openshift.io/suite': string;
      'compliance.openshift.io/scan-name': string;
    };
    annotations: Record<string, string>;
  };
  id: string;
  description: string;
  instructions: string;
  rationale: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  // status: 'PASS' | 'FAIL' | 'MANUAL' | 'INFO' | 'INCONSISTENT';
}

export const ComplianceCheckResultModel: K8sModel = {
  apiGroup: 'compliance.openshift.io',
  apiVersion: 'v1alpha1',
  kind: 'ComplianceCheckResult',
  plural: 'compliancecheckresults',
  namespaced: true,
  label: 'Compliance Check Result',
  labelPlural: 'Compliance Check Results',
  abbr: 'CCR',
};
