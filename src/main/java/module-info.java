module academic.kme {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.web;

    requires org.controlsfx.controls;
    requires com.dlsc.formsfx;
    requires org.kordamp.ikonli.javafx;
    requires org.kordamp.bootstrapfx.core;
    requires org.hibernate.orm.core;
    requires java.naming;
    requires java.sql;
    requires jakarta.persistence;
    requires org.apache.pdfbox;
    requires PDFViewerFX;

    opens academic.kme.model to org.hibernate.orm.core;
    opens academic.kme to javafx.fxml;
    opens academic.kme.controllers to javafx.fxml;
    opens academic.kme.controllers.Graphics to javafx.fxml;
    exports academic.kme;
}