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
    requires lombok;

    opens academic.kme.model.NoteCluster to org.hibernate.orm.core;
    opens academic.kme.model.Voice to org.hibernate.orm.core;
    opens academic.kme.model.Measure to org.hibernate.orm.core;
    opens academic.kme.model.Staff to org.hibernate.orm.core;
    opens academic.kme.model.StaffGroup to org.hibernate.orm.core;
    opens academic.kme.model.Document to org.hibernate.orm.core;

    opens academic.kme to javafx.fxml;
    opens academic.kme.controller to javafx.fxml;
    opens academic.kme.controller.Graphics to javafx.fxml;
    exports academic.kme;

    exports academic.kme.model.NoteCluster;
    exports academic.kme.model.Voice;
    exports academic.kme.model.Measure;
    exports academic.kme.model.Staff;
    exports academic.kme.model.StaffGroup;
    exports academic.kme.model.Document;
    opens academic.kme.controller.Graphics.Architect to javafx.fxml;
    opens academic.kme.controller.Graphics.Artist to javafx.fxml;
}