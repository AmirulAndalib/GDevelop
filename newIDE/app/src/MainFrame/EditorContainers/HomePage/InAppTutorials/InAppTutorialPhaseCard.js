// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import Divider from '@material-ui/core/Divider';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';
import { CardWidget } from '../CardWidget';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import Chip from '../../../../UI/Chip';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { Trans } from '@lingui/macro';

const getImageSize = ({ isMobile }: { isMobile: boolean }) =>
  isMobile ? 90 : 130;

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 10px 15px 10px',
  },
  lockerImage: { height: 80, width: 80 },
  imageContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPointsList: {
    paddingInlineStart: 12,
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
};

type Props = {|
  progress?: number,
  /** For tutorials that cannot be started yet. */
  locked?: boolean,
  size?: 'large' | 'banner',
  /** To prevent start on click. */
  disabled?: boolean,
  title: MessageDescriptor,
  description: MessageDescriptor,
  shortDescription: MessageDescriptor,
  durationInMinutes?: number,
  keyPoints?: Array<MessageDescriptor>,
  onClick: () => void,
  renderImage: (props: any) => React.Node,
  loading?: boolean,
|};

const getTextStyle = disabled => (disabled ? { opacity: 0.4 } : undefined);

const InAppTutorialPhaseCard = ({
  progress,
  locked,
  size = 'large',
  disabled,
  title,
  description,
  shortDescription,
  durationInMinutes,
  keyPoints,
  onClick,
  renderImage,
  loading,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const shouldTextBeDisabled = loading || disabled || locked;
  const { isMobile } = useResponsiveWindowSize();
  const imageSize = getImageSize({ isMobile });

  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget
          onClick={onClick}
          size={size}
          disabled={shouldTextBeDisabled}
        >
          <Column noMargin alignItems="center" expand>
            <div
              style={{
                ...styles.imageContainer,
                height: imageSize,
                backgroundColor: locked
                  ? gdevelopTheme.paper.backgroundColor.light
                  : disabled
                  ? gdevelopTheme.palette.type === 'dark'
                    ? '#4F28CD'
                    : '#9979F1'
                  : '#7046EC',
              }}
            >
              {locked ? (
                <Lock style={styles.lockerImage} />
              ) : (
                renderImage({
                  style: {
                    height: imageSize,
                    width: imageSize,
                    opacity: disabled ? 0.6 : 1,
                  },
                })
              )}
            </div>
            <div
              style={{
                ...styles.cardTextContainer,
                maxWidth: size === 'banner' ? '40%' : undefined,
              }}
            >
              <ColumnStackLayout
                expand
                justifyContent="flex-start"
                useFullHeight
              >
                {progress && progress > 0 ? (
                  progress !== 100 ? (
                    <LineStackLayout alignItems="center" noMargin>
                      <Text displayInlineAsSpan noMargin size="body2">
                        {progress}%
                      </Text>
                      <ColoredLinearProgress value={progress} />
                    </LineStackLayout>
                  ) : (
                    <Line noMargin justifyContent="center">
                      <Chip
                        size="small"
                        label={<Trans>Finished</Trans>}
                        style={{
                          backgroundColor:
                            gdevelopTheme.statusIndicator.success,
                          color: '#111111',
                        }}
                      />
                    </Line>
                  )
                ) : durationInMinutes ? (
                  <Line noMargin justifyContent="center">
                    <Chip
                      size="small"
                      label={
                        durationInMinutes === 1 ? (
                          <Trans>1 minute</Trans>
                        ) : (
                          <Trans>{durationInMinutes} minutes</Trans>
                        )
                      }
                    />
                  </Line>
                ) : (
                  <Spacer />
                )}
                <Text
                  size="block-title"
                  noMargin
                  style={getTextStyle(shouldTextBeDisabled)}
                  color="primary"
                >
                  {i18n._(title)}
                </Text>
                <Text
                  size="body"
                  noMargin
                  style={getTextStyle(shouldTextBeDisabled)}
                  color="secondary"
                >
                  {isMobile ? i18n._(shortDescription) : i18n._(description)}
                </Text>
                {keyPoints && <Divider />}
                {keyPoints && (
                  <Column
                    noMargin
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    expand
                  >
                    <ul style={styles.keyPointsList}>
                      {keyPoints.map((keyPoint, index) => (
                        <Text
                          key={`key-point-${index}`}
                          size="body2"
                          noMargin
                          style={getTextStyle(shouldTextBeDisabled)}
                          color="secondary"
                          displayAsListItem
                        >
                          {i18n._(keyPoint)}
                        </Text>
                      ))}
                    </ul>
                  </Column>
                )}
              </ColumnStackLayout>
            </div>
          </Column>
        </CardWidget>
      )}
    </I18n>
  );
};

export default InAppTutorialPhaseCard;
