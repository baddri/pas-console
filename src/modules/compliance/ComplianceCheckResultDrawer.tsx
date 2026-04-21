import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
  Title,
  Label,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Divider,
  Button,
  ClipboardCopy,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { ComplianceCheckResultKind, ComplianceStatus, ComplianceSeverity } from '../../types/ComplianceCheckResult';
import * as React from 'react';

interface ComplianceCheckResultDrawerProps {
  selected: ComplianceCheckResultKind | null;
  onClose: () => void;
  children: React.ReactNode; // the table sits here as drawer main content
}

const renderStatusLabel = (status: ComplianceStatus) => {
  switch (status) {
    case 'PASS':
      return <Label color="green">{status}</Label>;
    case 'FAIL':
      return <Label color="red">{status}</Label>;
    case 'MANUAL':
      return <Label color="blue">{status}</Label>;
    case 'INFO':
      return <Label color="teal">{status}</Label>;
    case 'INCONSISTENT':
      return <Label color="orange">{status}</Label>;
    default:
      return <Label color="grey">{status}</Label>;
  }
};

const renderSeverityLabel = (severity: ComplianceSeverity) => {
  switch (severity) {
    case 'critical':
      return <Label color="purple">Critical</Label>;
    case 'high':
      return <Label color="red">High</Label>;
    case 'medium':
      return <Label color="orange">Medium</Label>;
    case 'low':
      return <Label color="green">Low</Label>;
    default:
      return <Label color="grey">{severity}</Label>;
  }
};

// extract the short rule name from the xccdf id
// xccdf_org.ssgproject.content_rule_accounts_restrict_service_account_tokens
// → accounts-restrict-service-account-tokens
const xccdfToReadable = (id: string): string => {
  const prefix = 'xccdf_org.ssgproject.content_rule_';
  if (id.startsWith(prefix)) {
    return id.replace(prefix, '').replaceAll('_', '-');
  }
  return id;
};

// link to the upstream STIG/rule doc on complianceascode
const xccdfToDocUrl = (id: string): string => {
  const ruleName = id.replace('xccdf_org.ssgproject.content_rule_', '');
  return `https://github.com/ComplianceAsCode/content/search?q=${ruleName}`;
};

export const ComplianceCheckResultDrawer: React.FC<ComplianceCheckResultDrawerProps> = ({
  selected,
  onClose,
  children,
}) => {
  const isExpanded = !!selected;

  const panelContent = selected ? (
    <DrawerPanelContent widths={{ default: 'width_50' }}>
      <DrawerHead>
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>
            <Title headingLevel="h2" size="lg">
              {selected.description?.split('\n')[0]?.trim() ?? selected.metadata.name}
            </Title>
          </FlexItem>
        </Flex>
        <Flex gap={{ default: 'gapSm' }} style={{ marginTop: '0.5rem' }}>
          {renderStatusLabel(selected.metadata.labels['compliance.openshift.io/check-status'])}
          {renderSeverityLabel(selected.metadata.labels['compliance.openshift.io/check-severity'])}
          <Label color="grey" variant="outline">
            {selected.metadata.labels['compliance.openshift.io/suite'].toUpperCase()}
          </Label>
          <Label color="grey" variant="outline">
            {selected.metadata.labels['compliance.openshift.io/scan-name']}
          </Label>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>

      <Divider />

      <DrawerPanelBody>
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{ default: '15ch' }}
          style={{ marginBottom: '1.5rem' }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>Rule ID</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied" variant="inline-compact">
                    {selected.id}
                  </ClipboardCopy>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="link"
                    isInline
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                    component="a"
                    href={xccdfToDocUrl(selected.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {xccdfToReadable(selected.id)}
                  </Button>
                </FlexItem>
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Last scanned</DescriptionListTerm>
            <DescriptionListDescription>
              {new Date(
                selected.metadata.annotations['compliance.openshift.io/last-scanned-timestamp'],
              ).toLocaleString()}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Namespace</DescriptionListTerm>
            <DescriptionListDescription>{selected.metadata.namespace}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>

        <Divider style={{ marginBottom: '1.5rem' }} />

        <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
          Description
        </Title>
        <p style={{ lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{selected.description}</p>

        <Divider style={{ marginBottom: '1.5rem' }} />

        <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
          Instructions
        </Title>
        <p style={{ lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{selected.instructions}</p>

        <Divider style={{ marginBottom: '1.5rem' }} />

        <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
          Rationale
        </Title>
        <p style={{ lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{selected.rationale}</p>

        <Divider style={{ marginBottom: '1.5rem' }} />

        <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
          Compliance standards
        </Title>
        <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '1.5rem' }}>
          {selected.metadata.annotations['policies.open-cluster-management.io/standards']
            ?.split(',')
            .map((s) => s.trim())
            .map((s) => (
              <FlexItem key={s}>
                <Label color="blue" variant="outline">
                  {s}
                </Label>
              </FlexItem>
            ))}
        </Flex>
      </DrawerPanelBody>
    </DrawerPanelContent>
  ) : null;

  return (
    <Drawer isExpanded={isExpanded} position="right">
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
