module academic.kme {
    requires javafx.controls;
    requires javafx.fxml;

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
    opens academic.kme.controllers to javafx.fxml;
    exports academic.kme;
}