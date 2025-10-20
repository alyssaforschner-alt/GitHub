package de.dhbw.stuttgart.test2.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "random_word")
public class RandomWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "word_value", nullable = false, unique = true, length = 5)
    private String value;

    protected RandomWord() {
    }

    public RandomWord(String value) {
        setValue(value);
    }

    public Long getId() {
        return id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value == null ? null : value.toLowerCase(java.util.Locale.ROOT);
    }
}
