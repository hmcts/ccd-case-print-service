package uk.gov.hmcts.ccd.printservice.befta;

import uk.gov.hmcts.befta.BeftaTestDataLoader;
import uk.gov.hmcts.befta.DefaultBeftaTestDataLoader;
import uk.gov.hmcts.befta.DefaultTestAutomationAdapter;
import uk.gov.hmcts.befta.dse.ccd.CcdEnvironment;
import uk.gov.hmcts.befta.exception.FunctionalTestException;
import uk.gov.hmcts.befta.player.BackEndFunctionalTestScenarioContext;
import uk.gov.hmcts.befta.util.ReflectionUtils;

public class CasePrintServiceTestAutomationAdapter extends DefaultTestAutomationAdapter {

    @Override
    protected BeftaTestDataLoader buildTestDataLoader() {
        return new DefaultBeftaTestDataLoader(CcdEnvironment.AAT);
    }

    @Override
    public synchronized Object calculateCustomValue(BackEndFunctionalTestScenarioContext scenarioContext, Object key) {
        if (key.toString().startsWith("approximately ")) {
            try {
                String actualSize = (String) ReflectionUtils.deepGetFieldInObject(scenarioContext,
                        "testData.actualResponse.body.__fileInBody__.size");
                String expectedSize = key.toString().replace("approximately ", "");
                int actualValue = Integer.parseInt(actualSize);
                int expectedValue = Integer.parseInt(expectedSize);
                if (Math.abs(actualValue - expectedValue) < 50)
                    return actualSize;
                return expectedSize;
            } catch (Exception e) {
                throw new FunctionalTestException("Problem checking acceptable response payload size: ", e);
            }
        }
        return super.calculateCustomValue(scenarioContext, key);
    }
}
