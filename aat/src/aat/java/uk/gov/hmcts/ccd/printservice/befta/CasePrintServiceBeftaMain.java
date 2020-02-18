package uk.gov.hmcts.ccd.printservice.befta;

import uk.gov.hmcts.befta.BeftaMain;

public class CasePrintServiceBeftaMain extends BeftaMain {

  public static void main(String[] args) {
    setTaAdapter(new CasePrintServiceTestAutomationAdapter());
    BeftaMain.main(args);
  }

}
