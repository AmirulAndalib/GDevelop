// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import { SectionRow } from '../SectionContainer';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import { formatTutorialToImageTileComponent } from '../LearnSection';
import ImageTileRow from '../../../../UI/ImageTileRow';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Text from '../../../../UI/Text';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import { type Tutorial } from '../../../../Utils/GDevelopServices/Tutorial';
import { CardWidget } from '../CardWidget';
import Window from '../../../../Utils/Window';
import { ColumnStackLayout } from '../../../../UI/Layout';
import { type GuidedLessonsRecommendation } from '../../../../Utils/GDevelopServices/User';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import { SurveyCard } from './SurveyCard';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import PromotionsSlideshow from '../../../../Promotions/PromotionsSlideshow';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';
import FlatButton from '../../../../UI/FlatButton';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import { type NewProjectSetup } from '../../../../ProjectCreation/NewProjectSetupDialog';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';

const styles = {
  textTutorialContent: {
    padding: 20,
    flex: 1,
    display: 'flex',
  },
};

const useStyles = makeStyles({
  tile: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
});

const getTextTutorialsColumnsFromWidth = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 2;
    case 'large':
      return 4;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};
const getVideoTutorialsColumnsFromWidth = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 5 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};
const getTutorialsLimitsFromWidth = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 5 : 3;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};

type TextTutorialsRowProps = {|
  tutorials: Array<Tutorial>,
  i18n: I18nType,
|};

const TextTutorialsRow = ({ tutorials, i18n }: TextTutorialsRowProps) => {
  const classes = useStyles();
  const { isLandscape, windowSize } = useResponsiveWindowSize();

  return (
    <>
      <Column noMargin>
        <Text size="section-title" noMargin>
          <Trans>Read</Trans>
        </Text>
        <Text>
          <Trans>
            Text-based content directly from GDevelop’s site and Wiki.
          </Trans>
        </Text>
      </Column>
      <GridList
        cols={getTextTutorialsColumnsFromWidth(windowSize, isLandscape)}
        cellHeight="auto"
        spacing={10}
      >
        {tutorials.map(tutorial => (
          <GridListTile key={tutorial.id} classes={{ tile: classes.tile }}>
            <CardWidget
              onClick={() =>
                Window.openExternalURL(
                  selectMessageByLocale(i18n, tutorial.linkByLocale)
                )
              }
              size="large"
            >
              <div style={styles.textTutorialContent}>
                <ColumnStackLayout expand justifyContent="center" useFullHeight>
                  <Text noMargin size="block-title">
                    {selectMessageByLocale(i18n, tutorial.titleByLocale)}
                  </Text>
                  <Text noMargin size="body" color="secondary">
                    {selectMessageByLocale(i18n, tutorial.descriptionByLocale)}
                  </Text>
                </ColumnStackLayout>
              </div>
            </CardWidget>
          </GridListTile>
        ))}
      </GridList>
    </>
  );
};

type Props = {|
  authenticatedUser: AuthenticatedUser,
  selectInAppTutorial: (tutorialId: string) => void,
  onStartSurvey: null | (() => void),
  hasFilledSurveyAlready: boolean,
  onOpenProfile: () => void,
  onCreateProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType,
    isQuickCustomization?: boolean
  ) => Promise<void>,
  askToCloseProject: () => Promise<boolean>,
|};

const RecommendationList = ({
  authenticatedUser,
  selectInAppTutorial,
  onStartSurvey,
  hasFilledSurveyAlready,
  onOpenProfile,
  onCreateProjectFromExample,
  askToCloseProject,
}: Props) => {
  const { recommendations, limits } = authenticatedUser;
  const { tutorials } = React.useContext(TutorialContext);
  const {
    getTutorialProgress,
    values: { showInAppTutorialDeveloperMode },
  } = React.useContext(PreferencesContext);
  const { onLoadInAppTutorialFromLocalFile } = React.useContext(
    InAppTutorialContext
  );

  const [
    selectedTutorial,
    setSelectedTutorial,
  ] = React.useState<Tutorial | null>(null);

  if (!recommendations) return <PlaceholderLoader />;

  const recommendedTutorials = tutorials
    ? recommendations
        .map(recommendation =>
          recommendation.type === 'gdevelop-tutorial'
            ? tutorials.find(tutorial => tutorial.id === recommendation.id)
            : null
        )
        .filter(Boolean)
    : [];

  const recommendedVideoTutorials = recommendedTutorials.filter(
    tutorial => tutorial.type === 'video'
  );
  const recommendedTextTutorials = recommendedTutorials.filter(
    tutorial => tutorial.type === 'text'
  );

  // $FlowIgnore
  const guidedLessonsRecommendation: ?GuidedLessonsRecommendation = recommendations.find(
    recommendation => recommendation.type === 'guided-lessons'
  );
  const guidedLessonsIds = guidedLessonsRecommendation
    ? guidedLessonsRecommendation.lessonsIds
    : null;

  const getInAppTutorialPartProgress = ({
    tutorialId,
  }: {
    tutorialId: string,
  }) => {
    const tutorialProgress = getTutorialProgress({
      tutorialId,
      userId: authenticatedUser.profile
        ? authenticatedUser.profile.id
        : undefined,
    });
    if (!tutorialProgress || !tutorialProgress.progress) return 0;
    return tutorialProgress.progress[0]; // guided lessons only have one part.
  };

  return (
    <I18n>
      {({ i18n }) => {
        const items = [];

        if (onStartSurvey && !hasFilledSurveyAlready)
          items.push(
            <SectionRow key="start-survey">
              <SurveyCard
                onStartSurvey={onStartSurvey}
                hasFilledSurveyAlready={false}
              />
            </SectionRow>
          );

        if (guidedLessonsRecommendation) {
          const displayTextAfterGuidedLessons = guidedLessonsIds
            ? guidedLessonsIds
                .map(tutorialId => getInAppTutorialPartProgress({ tutorialId }))
                .every(progress => progress === 100)
            : false;

          items.push(
            <SectionRow key="guided-lessons">
              <Line justifyContent="space-between" noMargin alignItems="center">
                <Text size="section-title" noMargin>
                  <Trans>Build game mechanics</Trans>
                </Text>
                {showInAppTutorialDeveloperMode && (
                  <FlatButton
                    label={<Trans>Load local lesson</Trans>}
                    onClick={onLoadInAppTutorialFromLocalFile}
                  />
                )}
              </Line>
              <GuidedLessons
                selectInAppTutorial={selectInAppTutorial}
                lessonsIds={guidedLessonsIds}
              />
              {displayTextAfterGuidedLessons && (
                <Text>
                  <Trans>
                    Congratulations on completing this selection of guided
                    lessons! Find all lessons in the Learn section.
                  </Trans>
                </Text>
              )}
            </SectionRow>
          );
        }

        if (recommendedVideoTutorials.length) {
          items.push(
            <SectionRow key="videos">
              <ImageTileRow
                title={<Trans>Get started with game creation</Trans>}
                margin="dense"
                items={recommendedVideoTutorials.map(tutorial =>
                  formatTutorialToImageTileComponent({
                    i18n,
                    limits,
                    tutorial,
                    onSelectTutorial: setSelectedTutorial,
                  })
                )}
                getColumnsFromWindowSize={getVideoTutorialsColumnsFromWidth}
                getLimitFromWindowSize={getTutorialsLimitsFromWidth}
              />
            </SectionRow>
          );
        }

        if (onStartSurvey && hasFilledSurveyAlready)
          items.push(
            <SectionRow key="start-survey">
              <SurveyCard
                onStartSurvey={onStartSurvey}
                hasFilledSurveyAlready
              />
            </SectionRow>
          );

        items.push(
          <SectionRow key="promotions">
            <Text size="section-title" noMargin>
              <Trans>Discover the ecosystem</Trans>
            </Text>
            <Spacer />
            <PromotionsSlideshow />
          </SectionRow>
        );

        if (recommendedTextTutorials.length) {
          items.push(
            <SectionRow key="texts">
              <TextTutorialsRow
                tutorials={recommendedTextTutorials}
                i18n={i18n}
              />
            </SectionRow>
          );
        }

        return (
          <>
            {items}
            {selectedTutorial && (
              <PrivateTutorialViewDialog
                tutorial={selectedTutorial}
                onClose={() => setSelectedTutorial(null)}
              />
            )}
          </>
        );
      }}
    </I18n>
  );
};

export default RecommendationList;
