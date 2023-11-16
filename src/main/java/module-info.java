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

    opens academic.kme.model to org.hibernate.orm.core;
    opens academic.kme to javafx.fxml;
    opens academic.kme.controller to javafx.fxml;
    opens academic.kme.controller.Graphics to javafx.fxml;
    exports academic.kme;
    opens academic.kme.model.Document to org.hibernate.orm.core;
    opens academic.kme.model.Note to org.hibernate.orm.core;
}